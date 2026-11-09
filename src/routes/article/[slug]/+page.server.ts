import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchArticle } from '#lib/article/fetchArticle';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
  try {
    const payload = await fetchArticle(params.slug);
    setHeaders({ 'cache-control': 'public, max-age=300' });
    return { article: payload.article, tag: payload.tag ?? null };
  } catch (cause) {
    console.error(`文章加载失败：${params.slug}`, cause);
    return error(404, '文章不存在或暂时无法加载');
  }
};
