import type { Handle } from '@sveltejs/kit';

/**
 * sitemap 中列出的页面路径集合，需与 static/sitemap.xml 保持一致。
 * 这些页面的 HTML 响应将携带 max-age 缓存指令。
 */
const SITEMAP_ROUTES: ReadonlySet<string> = new Set([
  '/',
  '/notice',
  '/notice/interaction',
  '/notice/reply',
  '/notice/share',
  '/notice/system',
  '/register',
  '/search',
  '/oauth',
  '/oauth/callback',
  '/settings/auth',
]);

/**
 * 边缘缓存时长（秒），4 小时。
 * Cloudflare Crawler Hints 依赖响应头中的 max-age 指令来判定页面可缓存，
 * 缓存过期回源刷新后即向搜索引擎推送 URL 变更信号。
 */
const CACHE_MAX_AGE = 14400;

/**
 * 为 sitemap 页面注入 Cache-Control 响应头，激活 Cloudflare Crawler Hints。
 * 仅对 GET 请求的 HTML 页面生效，静态资源与 API 由资源自身头部控制。
 * @param event SvelteKit 请求事件
 * @param resolve 后续处理链
 */
export const handle: Handle = async ({ event, resolve }) => {
  if (event.request.method === 'GET' && SITEMAP_ROUTES.has(event.url.pathname)) {
    event.setHeaders({
      'cache-control': `public, max-age=${CACHE_MAX_AGE}, must-revalidate`,
    });
  }
  return resolve(event);
};
