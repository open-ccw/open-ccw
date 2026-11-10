import type { Article, ArticlePayload } from './types';
import { detectPayloadKind, findContainerByKey, parseFlightModels } from './rsc.ts';
import { normalizeArticleContent } from './content.ts';

/** CCW 创作者学院站点源 */
const LEARN_ORIGIN = 'https://learn.ccw.site';

/** 无浏览器 UA 时上游只返回空壳 HTML，拿不到 RSC 流 */
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/** 上游文章对象：content 可能是 JSON 字符串，也可能是已解析对象 */
type RawArticle = Omit<Article, 'content'> & { content: unknown };

/**
 * 解析文章负载：从包含 article 字段的容器对象上同时取 slug 与 tag
 * @param models 已解引用的模型值
 * @returns 文章负载
 * @throws 未找到文章数据时抛出
 */
function pickPayload(models: Array<{ id: string; value: unknown }>): ArticlePayload {
  // 文章对象位于 Suspense 边界内部，其所在容器同时携带 slug 与 tag
  const holder = findContainerByKey(
    models,
    'article',
    (value) => typeof value.title === 'string' && typeof value.slug === 'string',
  );
  if (!holder) {
    throw new Error('未在页面中找到文章数据');
  }

  const article = holder.article as unknown as RawArticle;
  const slug = typeof holder.slug === 'string' ? holder.slug : article.slug;
  return {
    article: { ...article, slug, content: normalizeArticleContent(article.content) },
    tag: typeof holder.tag === 'string' ? holder.tag : undefined,
  };
}

/**
 * 从创作者学院文章页的 HTML 中解析出文章数据
 * @param html 文章页 HTML
 * @returns 文章负载
 * @throws 页面中没有可识别的文章数据时抛出
 */
export function parseArticlePayload(html: string): ArticlePayload {
  const kind = detectPayloadKind(html);
  if (kind === 'UNKNOWN') {
    throw new Error('页面不是可识别的 Next.js 数据负载');
  }
  if (kind === 'PAGES_ROUTER') {
    throw new Error('页面使用了 Pages Router 负载，暂不支持');
  }
  return pickPayload(parseFlightModels(html));
}

/**
 * 抓取并解析指定 slug 的文章
 * @param slug 文章 slug
 * @returns 文章负载
 */
export async function fetchArticle(slug: string): Promise<ArticlePayload> {
  const url = new URL(`/post/${encodeURIComponent(slug)}`, LEARN_ORIGIN);
  const response = await fetch(url, {
    headers: {
      'user-agent': BROWSER_UA,
      accept: 'text/html,application/xhtml+xml',
      'accept-language': 'zh-CN,zh;q=0.9',
    },
  });
  if (!response.ok) {
    throw new Error(`上游返回 ${response.status}`);
  }
  return parseArticlePayload(await response.text());
}
