import type { ArticleEntity } from './types';

/** 切分后的内联片段 */
export interface InlineSegment {
  text: string;
  bold: boolean;
  underline: boolean;
  strike: boolean;
  /** 该片段关联的富文本实体，例如提及、作品卡片 */
  entity?: ArticleEntity;
}

/** 单个富文本块的渲染模型 */
export interface ArticleBlockModel {
  type: string;
  centered: boolean;
  segments: InlineSegment[];
}

/**
 * 按内联样式与实体区间把富文本块切成可渲染的片段
 * @param block 原始富文本块
 * @param entityMap 实体表
 * @returns 带样式的片段列表与块级对齐信息
 */
export function splitBlock(
  block: {
    type: string;
    text: string;
    inlineStyleRanges?: { offset: number; length: number; style: string }[];
    entityRanges?: { offset: number; length: number; key: number }[];
  },
  entityMap: Record<string, ArticleEntity>,
): ArticleBlockModel {
  const styleRanges = block.inlineStyleRanges ?? [];
  const entityRanges = block.entityRanges ?? [];
  const length = block.text.length;
  const points = new Set<number>([0, length]);

  for (const range of [...styleRanges, ...entityRanges]) {
    points.add(Math.max(0, range.offset));
    points.add(Math.min(length, range.offset + range.length));
  }

  const boundaries = [...points].sort((a, b) => a - b);
  const segments: InlineSegment[] = [];

  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    if (end <= start) continue;

    const covers = (range: { offset: number; length: number }) =>
      range.offset <= start && start < range.offset + range.length;
    const styles = new Set(styleRanges.filter(covers).map((range) => range.style));
    const entityRange = entityRanges.find(covers);

    segments.push({
      text: block.text.slice(start, end),
      bold: styles.has('BOLD'),
      underline: styles.has('UNDERLINE'),
      strike: styles.has('STRIKETHROUGH'),
      entity: entityRange ? entityMap[String(entityRange.key)] : undefined,
    });
  }

  return {
    type: block.type,
    centered: styleRanges.some((range) => range.style === 'center'),
    segments,
  };
}
