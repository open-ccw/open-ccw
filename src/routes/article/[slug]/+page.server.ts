import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch, params, setHeaders, request }) => {
  try {
    const res = await fetch(url.pathname + '/json');
    const payload = await res.json();

    setHeaders({
      'cache-control': 'public, max-age=300',
      etag: res.headers.get('etag') || '???',
      'server-timing': res.headers.get('server-timing') || '',
    });

    return { article: payload.article, tag: payload.tag ?? null };
  } catch (cause) {
    console.error(`文章加载失败：${params.slug}`, cause);
    return error(404, '文章不存在或暂时无法加载');
  }
};
