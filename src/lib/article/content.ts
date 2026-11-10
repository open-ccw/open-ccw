import type { Article, ArticleEntity, ArticleInlineStyleRange } from './types';

/** 站点正文的富文本卡片，形如 [类型, 数据] */
type ContentCard = [string, Record<string, unknown>];

/** 站点正文的内联片段：原子索引、标记下标、链接类型、文本 */
type ContentRun = [number, number[], number, string];

/** 站点正文的块，形如 [1, 块类型, 内联片段] 或 [10, 卡片下标] */
type ContentSection = [number, ...unknown[]];

/** 站点 0.3.x 正文结构 */
interface RichContent {
  version?: string;
  atoms?: unknown[];
  cards?: ContentCard[];
  markups?: Array<[string, unknown?]>;
  sections?: ContentSection[];
}

/** 标记类型到 Draft.js 内联样式的映射 */
const MARKUP_STYLES: Record<string, string> = {
  strong: 'BOLD',
  b: 'BOLD',
  em: 'ITALIC',
  i: 'ITALIC',
  u: 'UNDERLINE',
  underline: 'UNDERLINE',
  strike: 'STRIKETHROUGH',
  strikethrough: 'STRIKETHROUGH',
};

/** 正文块类型到 Draft.js 块类型的映射 */
const SECTION_TYPES: Record<string, string> = {
  p: 'unstyled',
  h1: 'header-one',
  h2: 'header-two',
  h3: 'header-three',
  h4: 'header-four',
  blockquote: 'blockquote',
  ul: 'unordered-list-item',
  ol: 'ordered-list-item',
};

/**
 * 把站点富文本卡片转换为视图可渲染的实体
 * @param card 卡片元组
 * @returns 实体，无法识别的卡片返回 undefined
 */
function cardToEntity(card: ContentCard): ArticleEntity | undefined {
  const [type, data] = card;
  if (type === 'image' && typeof data.src === 'string') {
    const title = typeof data.alt === 'string' && data.alt ? data.alt : data.title;
    return {
      type: 'images',
      data: { url: data.src, title: typeof title === 'string' ? title : undefined },
    };
  }
  if (type === 'project' && typeof data.projectOid === 'string') {
    return {
      type: 'project',
      data: {
        creationId: data.projectOid,
        title: typeof data.title === 'string' ? data.title : undefined,
      },
    };
  }
  if (type === 'video' && typeof data.src === 'string') {
    return {
      type: 'videos',
      data: { url: data.src, title: typeof data.title === 'string' ? data.title : undefined },
    };
  }
  return undefined;
}

/**
 * 把站点 0.3.x 的 sections 正文转换为 Draft.js raw 结构
 * @param content 站点富文本结构
 * @returns 与视图兼容的 blocks 与 entityMap
 */
function convertSections(content: RichContent): Article['content'] {
  const entityMap: Record<string, ArticleEntity> = {};
  const blocks: Article['content']['blocks'] = [];
  const markups = content.markups ?? [];
  const cards = content.cards ?? [];
  let entityKey = 0;

  for (const section of content.sections ?? []) {
    if (section[0] === 10) {
      const card = cards[section[1] as number];
      const entity = card ? cardToEntity(card) : undefined;
      if (!entity) continue;
      const key = String(entityKey++);
      entityMap[key] = entity;
      // atomic 块需要一个占位文本，视图按 entityRanges 渲染实体
      blocks.push({
        type: 'atomic',
        text: ' ',
        entityRanges: [{ offset: 0, length: 1, key: Number(key) }],
      });
      continue;
    }

    if (section[0] !== 1) continue;
    const runs = (section[2] ?? []) as ContentRun[];
    const type = SECTION_TYPES[String(section[1])] ?? 'unstyled';
    const inlineStyleRanges: ArticleInlineStyleRange[] = [];
    let text = '';

    for (const run of runs) {
      const value = run[run.length - 1];
      if (typeof value !== 'string') continue;
      const offset = text.length;
      text += value;

      const styles = new Set<string>();
      for (const index of Array.isArray(run[1]) ? run[1] : []) {
        const style = MARKUP_STYLES[markups[index]?.[0] ?? ''];
        if (style) styles.add(style);
      }
      for (const style of styles) {
        inlineStyleRanges.push({ offset, length: value.length, style });
      }
    }

    blocks.push({ type, text, inlineStyleRanges });
  }

  return { blocks, entityMap };
}

/**
 * 归一化文章正文，兼容 Draft.js raw 与站点 0.3.x sections 两种格式
 * @param raw 上游正文，可能是 JSON 字符串或已解析对象
 * @returns 视图可直接渲染的正文
 * @throws 正文结构无法识别时抛出
 */
export function normalizeArticleContent(raw: unknown): Article['content'] {
  let content: unknown = raw;
  if (typeof raw === 'string') {
    try {
      content = JSON.parse(raw) as unknown;
    } catch {
      throw new Error('文章正文不是合法 JSON');
    }
  }
  if (!content || typeof content !== 'object') {
    throw new Error('文章正文为空');
  }

  const record = content as Record<string, unknown>;
  const blocks = record.blocks;
  if (Array.isArray(blocks)) {
    return {
      blocks: blocks as Article['content']['blocks'],
      entityMap: (record.entityMap as Record<string, ArticleEntity>) ?? {},
    };
  }
  if (Array.isArray(record.sections)) {
    return convertSections(record as RichContent);
  }
  throw new Error('文章正文结构不符合预期');
}
