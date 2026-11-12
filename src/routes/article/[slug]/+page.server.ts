import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch, params, setHeaders, request }) => {
  try {
    const res = await fetch(url.pathname + '/json');
    const payload = (await res.json()) as any;

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
