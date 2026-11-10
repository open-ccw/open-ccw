/** React Flight 流中的一行 */
export interface FlightRow {
  id: string;
  /** 行标签：空标签为模型行，T 为文本行，I/HL/E 等为辅助行 */
  tag: string;
  value: unknown;
}

/** 页面负载形态 */
export type PayloadKind = 'PAGES_ROUTER' | 'APP_ROUTER_RSC' | 'UNKNOWN';

/** 单个 push 片段中的 RSC 文本，捕获组为 JSON 字符串字面量 */
const RSC_PUSH_RE = /self\.__next_f\.push\(\s*\[\s*1\s*,\s*("(?:\\.|[^"\\])*")\s*\]\s*\)/g;

/** 文本行的长度前缀：十六进制字节数 + 逗号 + 内容 */
const TEXT_ROW_HEAD_RE = /^([0-9a-fA-F]+),/;

/**
 * 判断页面使用哪种数据负载形态
 * @param html 页面 HTML
 * @returns 负载形态，App Router 为 self.__next_f.push 流式负载
 */
export function detectPayloadKind(html: string): PayloadKind {
  if (html.includes('<script id="__NEXT_DATA__"')) return 'PAGES_ROUTER';
  if (html.includes('self.__next_f.push(')) return 'APP_ROUTER_RSC';
  return 'UNKNOWN';
}

/**
 * 从 HTML 中提取并重组连续的 Flight 流。
 * 流式缓冲会把一条 row 切进多个 push()，必须先按顺序拼接再解析。
 * @param html 页面 HTML
 * @returns 拼接后的完整 Flight 文本
 */
export function extractFlightStream(html: string): string {
  const chunks: string[] = [];
  for (const match of html.matchAll(RSC_PUSH_RE)) {
    try {
      chunks.push(JSON.parse(match[1]) as string);
    } catch {
      // 单个片段转义异常时跳过，避免整页解析失败
    }
  }
  return chunks.join('');
}

/**
 * 从指定位置扫描出一个完整 JSON 值的结束位置，跳过字符串内的括号
 * @param source Flight 流
 * @param start JSON 起始下标
 * @returns JSON 结束下标（不含）
 */
function findJsonEnd(source: string, start: number): number {
  const head = source[start];
  if (head === '"') {
    for (let i = start + 1; i < source.length; i++) {
      if (source[i] === '\\') i++;
      else if (source[i] === '"') return i + 1;
    }
    return source.length;
  }

  let depth = 0;
  let inString = false;
  for (let i = start; i < source.length; i++) {
    const char = source[i];
    if (inString) {
      if (char === '\\') i++;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '[' || char === '{') depth++;
    else if (char === ']' || char === '}') {
      depth--;
      if (depth === 0) return i + 1;
    } else if (depth === 0 && char === '\n') return i;
  }
  return source.length;
}

/**
 * 解析 Flight 流为行表。重复 id（多见于 HL 行）保留首次出现的值。
 * @param stream Flight 文本
 * @returns id 到行的映射
 */
export function parseFlightRows(stream: string): Map<string, FlightRow> {
  const rows = new Map<string, FlightRow>();
  let cursor = 0;

  while (cursor < stream.length) {
    // 行之间以换行分隔，跳过前缀空白避免 id 被污染
    while (cursor < stream.length && (stream[cursor] === '\n' || stream[cursor] === '\r')) {
      cursor++;
    }
    const colon = stream.indexOf(':', cursor);
    if (colon === -1) break;
    const id = stream.slice(cursor, colon);
    cursor = colon + 1;
    if (cursor >= stream.length) break;

    const head = stream.slice(cursor, cursor + 32);

    if (stream[cursor] === 'T') {
      const match = TEXT_ROW_HEAD_RE.exec(head.slice(1));
      if (!match) break;
      const byteLength = Number.parseInt(match[1], 16);
      const contentStart = cursor + 1 + match[0].length;
      // 长度前缀是 UTF-8 字节数，按字节截取后再解码，否则中文会越界吞掉下一行
      const bytes = new TextEncoder().encode(stream.slice(contentStart));
      const text = new TextDecoder().decode(bytes.subarray(0, byteLength));
      cursor = contentStart + text.length;
      if (!rows.has(id)) rows.set(id, { id, tag: 'T', value: text });
      continue;
    }

    let tag = '';
    let jsonStart = cursor;
    if (/[A-Z]/.test(stream[cursor])) {
      let end = cursor;
      while (end < stream.length && /[A-Z]/.test(stream[end])) end++;
      tag = stream.slice(cursor, end);
      jsonStart = end;
    }

    const jsonEnd = findJsonEnd(stream, jsonStart);
    const raw = stream.slice(jsonStart, jsonEnd);
    cursor = jsonEnd;

    let value: unknown;
    try {
      value = JSON.parse(raw) as unknown;
    } catch {
      // 非 JSON 的辅助行（如错误说明）跳过
      continue;
    }
    if (!rows.has(id)) rows.set(id, { id, tag, value });
  }

  return rows;
}

/** 引用路径里禁止访问的键，防止原型链污染 */
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * 按 : 分隔的路径读取自有属性
 * @param target 目标值
 * @param path 路径字符串
 * @returns 路径取值，不存在时为 undefined
 */
function readPath(target: unknown, path: string): unknown {
  let current: unknown = target;
  for (const key of path.split(':')) {
    if (BLOCKED_KEYS.has(key)) return undefined;
    if (current === null || typeof current !== 'object') return undefined;
    if (!Object.hasOwn(current as object, key)) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/** 引用前缀：$L 客户端组件、$@ 分块、$F 服务端引用、$$ 或其他为模型引用 */
const REF_PREFIXES = ['$L', '$@', '$F', '$E', '$$'];

/**
 * 解析 Flight 中的 $ 引用为实际值
 * @param ref 形如 $L1d、$170、$@abc、$L1d:name
 * @param rows 行表
 * @param stack 递归栈，用于断环
 * @returns 引用指向的值
 */
function resolveRef(ref: string, rows: Map<string, FlightRow>, stack: Set<string>): unknown {
  if (ref === '$undefined') return undefined;
  // 单个 $ 是 React 元素标记，不是引用
  if (ref === '$') return ref;

  const prefix = REF_PREFIXES.find((item) => ref.startsWith(item)) ?? '$';
  const rest = ref.slice(prefix.length);
  const separator = rest.indexOf(':');
  const targetId = separator === -1 ? rest : rest.slice(0, separator);
  const path = separator === -1 ? null : rest.slice(separator + 1);

  const row = rows.get(targetId);
  if (!row) return { __unresolved__: ref };
  if (stack.has(targetId)) return { __circular__: ref };

  stack.add(targetId);
  const value = resolveValue(row.value, rows, stack);
  stack.delete(targetId);

  return path === null ? value : readPath(value, path);
}

/**
 * 递归解析值中的 $ 引用
 * @param value 任意 Flight 值
 * @param rows 行表
 * @param stack 递归栈
 * @returns 引用被替换后的值
 */
function resolveValue(value: unknown, rows: Map<string, FlightRow>, stack: Set<string>): unknown {
  if (typeof value === 'string') {
    return value.startsWith('$') ? resolveRef(value, rows, stack) : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, rows, stack));
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = resolveValue(item, rows, stack);
    }
    return result;
  }
  return value;
}

/**
 * 解析页面 HTML 为已解引用的模型值列表
 * @param html 页面 HTML
 * @returns 每个模型行的 id 与解引用后的值
 */
export function parseFlightModels(html: string): Array<{ id: string; value: unknown }> {
  const rows = parseFlightRows(extractFlightStream(html));
  const models: Array<{ id: string; value: unknown }> = [];
  for (const row of rows.values()) {
    if (row.tag !== '') continue;
    models.push({ id: row.id, value: resolveValue(row.value, rows, new Set([row.id])) });
  }
  return models;
}

/**
 * 在模型值中深度优先查找第一个满足条件的对象属性
 * @param models 模型值列表
 * @param pick 从对象中取出候选值，返回 undefined 表示不匹配继续递归
 * @returns 候选值，未找到时为 undefined
 */
function searchModels<T>(
  models: Array<{ id: string; value: unknown }>,
  pick: (record: Record<string, unknown>) => T | undefined,
): T | undefined {
  const seen = new Set<unknown>();

  const walk = (value: unknown): T | undefined => {
    if (value === null || typeof value !== 'object') return undefined;
    if (seen.has(value)) return undefined;
    seen.add(value);

    if (!Array.isArray(value)) {
      const picked = pick(value as Record<string, unknown>);
      if (picked !== undefined) return picked;
    }

    for (const item of Object.values(value as Record<string, unknown>)) {
      const found = walk(item);
      if (found !== undefined) return found;
    }
    return undefined;
  };

  for (const model of models) {
    const found = walk(model.value);
    if (found !== undefined) return found;
  }
  return undefined;
}

/**
 * 查找第一个包含指定 key 的容器对象，用于同时读取同级字段
 * @param models 模型值列表
 * @param key 目标属性名
 * @param accept 对属性值的额外校验
 * @returns 命中的容器对象，未找到时为 undefined
 */
export function findContainerByKey(
  models: Array<{ id: string; value: unknown }>,
  key: string,
  accept: (value: Record<string, unknown>) => boolean = () => true,
): Record<string, unknown> | undefined {
  return searchModels(models, (record) => {
    const candidate = record[key];
    if (
      candidate === null ||
      typeof candidate !== 'object' ||
      Array.isArray(candidate) ||
      !accept(candidate as Record<string, unknown>)
    ) {
      return undefined;
    }
    return record;
  });
}
