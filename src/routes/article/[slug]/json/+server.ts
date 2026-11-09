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
  let updatedAt = 0;
  try {
    updatedAt = await communityWeb.getPostDetail(params.slug).then(res=>res.updatedAt);
    if (!updatedAt) {
      return error(404, '未获取到文章数据');
    }
  }
  catch(e){
    return error(404, '未获取到文章数据'+String(e);
  }
  const cachedTest = await cache.match(
    new Request(articleCacheKey(params.slug), {
      headers: {
        'If-None-Match': md5(`ts-${updatedAt}`),
      },
    }),
  );
  if (cachedTest) {
    console.log('使用缓存', params.slug);
    const cachedRes = (await cache.match(articleCacheKey(params.slug)))!
    cachedRes.headers.set('Cache-Control', 'no-cache, max-age=36000')
    return cachedRes;
  }

  const article = await resolveArticleAndRefreshCache(cache, params.slug, updatedAt);
  return Response.json(article, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Article-Cache': 'MISSED',
      'Cache-Control': 'no-cache, max-age=36000',
    },
  });
};

async function resolveArticleAndRefreshCache(cache: Cache, slug: string, ts: number) {
  console.log('缓存未命中', slug);
  const article = await fetchArticle(slug);
  const response = Response.json(article, {
    headers: {
      Etag: md5(`ts-${ts}`),
      'Cache-Control': 'public, max-age=36000',
      'X-Article-Cache': 'HIT',
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
