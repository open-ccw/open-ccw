import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { communityWeb, setRequestUtils } from '@ccw-api/api';
import { md5 } from 'js-md5';
import { requestUtils } from '@ccw-api/request';
import { fetchArticle } from '#lib/article/fetchArticle';
import { indexnow } from '#lib/utils/indexNow.ts';

setRequestUtils(requestUtils);

function articleCacheKey(slug: string) {
  return `https://article-cache/json/${slug}`;
}

export const GET: RequestHandler = async ({ params }) => {
  const cache = await caches.open('Internal:Article');
  // const cached = await articleCache.match(`https://learn.ccw.site/article/${params.slug}`);
  // if (cached) {
  //   return Response.json({ html: await cached.text(), cached: true });
  // }
  const { updatedAt } = await communityWeb.getPostDetail(params.slug);
  if (!updatedAt) {
    return error(404, '未获取到文章数据');
  }
  const cached = await cache.match(
    new Request(articleCacheKey(params.slug), {
      headers: {
        'If-None-Match': md5(`ts-${updatedAt}`),
      },
    }),
  );
  if (cached) {
    console.log('使用缓存', params.slug);
    return (await cache.match(articleCacheKey(params.slug)))!;
  }

  const article = await resolveArticleAndRefreshCache(cache, params.slug, updatedAt);
  return Response.json(article, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};

async function resolveArticleAndRefreshCache(cache: Cache, slug: string, ts: number) {
  console.log('缓存未命中', slug);
  const article = await fetchArticle(slug);
  const response = Response.json(article, {
    headers: {
      Etag: md5(`ts-${ts}`),
      'Cache-Control': 'public, max-age=36000',
    },
  });
  await cache.put(articleCacheKey(slug), response);
  console.log(
    'indexnow',
    ...(await indexnow([`article/${slug}`]).then(
      (res) => res.map((r) => r.status),
      (e) => {
        console.error(e);
        return 'failed';
      },
    )),
  );
  return article;
}
