import type { Article, ArticlePayload } from './types';

/** CCW 创作者学院站点源 */
const LEARN_ORIGIN = 'https://learn.ccw.site';

/** Next.js RSC 数据推送片段 */
const RSC_PUSH_RE = /self\.__next_f\.push\((.*?)\)<\/script>/g;

/** 上游原始负载：content 可能是 JSON 字符串，也可能是已解析对象 */
interface RawArticle extends Omit<Article, 'content'> {
  content: Article['content'] | string;
}

interface RawPayload {
  article?: RawArticle;
  tag?: string;
}

/**
 * 从创作者学院文章页的 HTML 中解析出文章数据
 * @param html 文章页 HTML
 * @returns 文章负载
 * @throws 页面中没有可识别的文章数据时抛出
 */
export function parseArticlePayload(html: string): ArticlePayload {
  const chunks = Array.from(html.matchAll(RSC_PUSH_RE), (match) => match[1])
    .filter((chunk) => chunk[1] === '1')
    .flatMap((chunk) => (JSON.parse(chunk) as [number, string])[1].split('\x0a'))
    .filter(Boolean);

  const last = chunks.at(-1);
  if (!last) {
    throw new Error('未在页面中找到文章数据');
  }

  const parsed = JSON.parse(last.substring(3) || '[]') as unknown[];
  const payload = parsed[3] as RawPayload | undefined;
  if (!payload?.article) {
    throw new Error('文章数据结构不符合预期');
  }

  const rawContent = payload.article.content;
  const content = (
    typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent
  ) as Article['content'];
  if (!content || !Array.isArray(content.blocks)) {
    throw new Error('文章正文解析失败');
  }

  return { article: { ...payload.article, content }, tag: payload.tag };
}

/**
 * 抓取并解析指定 slug 的文章
 * @param slug 文章 slug
 * @returns 文章负载
 */
export async function fetchArticle(slug: string): Promise<ArticlePayload> {
  const url = new URL(`/article/${encodeURIComponent(slug)}`, LEARN_ORIGIN);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`上游返回 ${response.status}`);
  }
  return parseArticlePayload(await response.text());
}
