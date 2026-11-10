/** 富文本块中的内联样式区间（加粗、下划线、居中、颜色等） */
export interface ArticleInlineStyleRange {
  offset: number;
  length: number;
  style: string;
}

/** 富文本块引用的实体区间，key 指向 entityMap */
export interface ArticleEntityRange {
  offset: number;
  length: number;
  key: number;
}

/** 富文本块，格式与 Draft.js raw 内容一致 */
export interface ArticleBlock {
  key?: string;
  /** 块类型：unstyled / blockquote / header-three / atomic / unordered-list-item 等 */
  type: string;
  text: string;
  data?: Record<string, unknown>;
  inlineStyleRanges?: ArticleInlineStyleRange[];
  entityRanges?: ArticleEntityRange[];
}

/** 富文本实体的数据，不同实体类型字段不同 */
export interface ArticleEntityData {
  url?: string;
  href?: string;
  icon?: string;
  description?: string;
  linkType?: string;
  title?: string;
  imageType?: string;
  videoType?: string;
  embedType?: string;
  mention?: {
    name?: string;
    userId?: string;
  };
  userId?: string;
  userType?: string;
  creationId?: string;
  projectType?: string;
}

/** 富文本实体：图片、视频、嵌入内容、作品卡片、用户卡片、提及 */
export interface ArticleEntity {
  type: string;
  data: ArticleEntityData;
  mutability?: string;
}

/** 文章作者公开信息 */
export interface ArticleAuthor {
  oid: string;
  name: string;
  avatar: string;
}

/** 文章详情（CCW 创作者学院） */
export interface Article {
  oid: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  keywords?: string | null;
  featureImage?: {
    url?: string;
    alt?: string;
    caption?: string;
  } | null;
  author: ArticleAuthor;
  authorOid?: string;
  createdAt: number;
  publishedAt?: number;
  updatedAt?: number;
  pageView?: number;
  commentCount?: number | null;
  tags?: string[];
  tagRefs?: { name: string; slag: string }[];
  content: {
    blocks: ArticleBlock[];
    entityMap: Record<string, ArticleEntity>;
  };
}

/** 上游文章接口返回的完整负载 */
export interface ArticlePayload {
  article: Article;
  tag?: string;
}
