import { error } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import type { ArticlePayload } from '#lib/article/types';

export const load = async ({
  url,
  fetch,
  params,
  setHeaders,
}: Pick<RequestEvent, 'url' | 'fetch' | 'params' | 'setHeaders'>) => {
  try {
    const target = new URL(url.toString());
    target.pathname = `${target.pathname.replace(/\/$/, '')}/json`;
    target.search = '';
    target.hash = '';
    const res = await fetch(target);
    const payload = (await res.json()) as ArticlePayload;

    setHeaders({
      'cache-control': 'public, max-age=300',
      etag: res.headers.get('etag') || 'w/"???"',
      'server-timing': res.headers.get('server-timing') || '',
      'x-article-cache': res.headers.get('x-article-cache') || 'UNKNOWN',
    });

    return {
      article: payload.article,
      tag: payload.tag ?? null,
      newArticle: res.headers.get('x-article-cache') == 'MISSED',
    };
  } catch (cause) {
    console.error(`文章加载失败：${params.slug}`, cause);
    return error(404, '文章不存在或暂时无法加载');
  }
};
