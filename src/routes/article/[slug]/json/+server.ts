import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { communityWeb, setRequestUtils } from '@ccw-api/api';
import { md5 } from 'js-md5';
import { requestUtils } from '@ccw-api/request';
import { fetchArticle } from '#lib/article/fetchArticle';
import { indexNow } from '#lib/utils/indexNow.ts';

setRequestUtils(requestUtils);

function articleCacheKey(slug: string) {
  return `https://article-cache/json/${slug}`;
}

export const GET: RequestHandler = async ({ params, request }) => {
  const cache = await caches.open('Internal:Article');
  let updatedAt = 0;

  const ST_ts_start = Date.now();
  try {
    updatedAt = await communityWeb.getPostDetail(params.slug).then((res) => res.updatedAt);
    if (!updatedAt) {
      return error(404, '未获取到文章数据');
    }
  } catch (e) {
    return error(404, '未获取到文章数据' + String(e));
  }

  const ST_ts_meta_api = Date.now();

  const latestEtag = `"${md5(`ts-${updatedAt}`)}"`;
  if (request.headers.get('If-None-Match') == latestEtag) {
    return new Response(null, {
      status: 304,
      headers: {
        'Server-Timing': `metaAPI;dur=${ST_ts_meta_api - ST_ts_start}`,
      },
    });
  }
  const cachedTest = await cache.match(
    new Request(articleCacheKey(params.slug), {
      headers: {
        'If-None-Match': latestEtag,
      },
    }),
  );

  const ST_ts_cache_match = Date.now();

  if (cachedTest) {
    console.log('使用缓存', params.slug);
    const cached = await cache.match(articleCacheKey(params.slug)).then((r) => r!.json());
    return Response.json(cached, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Article-Cache': 'HIT',
        'Cache-Control': 'no-cache, max-age=36000',
        Etag: latestEtag,
        'Server-Timing': `metaAPI;dur=${ST_ts_meta_api - ST_ts_start}, cacheMatch;dur=${ST_ts_cache_match - ST_ts_meta_api}`,
      },
    });
  }

  const article = await resolveArticleAndRefreshCache(cache, params.slug, updatedAt);
  const ST_ts_resolve_article = Date.now();
  return Response.json(article, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Article-Cache': 'MISSED',
      'Cache-Control': 'no-cache, max-age=36000',
      Etag: latestEtag,
      'Server-Timing': `metaAPI;dur=${ST_ts_meta_api - ST_ts_start}, cacheMatch;dur=${ST_ts_cache_match - ST_ts_meta_api}, articleResolve;dur=${ST_ts_resolve_article - ST_ts_cache_match}`,
    },
  });
};

async function resolveArticleAndRefreshCache(cache: Cache, slug: string, ts: number) {
  console.log('缓存未命中', slug);
  const article = await fetchArticle(slug);
  const response = Response.json(article, {
    headers: {
      Etag: md5(`ts-${ts}`),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=36000',
      'X-Article-Cache': 'HIT',
    },
  });
  await cache.put(articleCacheKey(slug), response);
  await indexNow([`article/${slug}`]);
  return article;
}
