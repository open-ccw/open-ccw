import type { Handle } from '@sveltejs/kit/hooks';

/**
 * sitemap 中列出的页面路径集合，需与 src/routes/sitemap.xml/+server.ts 保持一致。
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
  '/sitemap.xml',
  '/robots.txt',
]);

/**
 * 边缘缓存时长（秒），4 小时。
 * Cloudflare Crawler Hints 依赖响应头中的 max-age 指令来判定页面可缓存，
 * 缓存过期回源刷新后即向搜索引擎推送 URL 变更信号。
 */
const CACHE_MAX_AGE = 14400;

/**
 * 允许对外服务并被搜索引擎索引的域名白名单（精确匹配）。
 * 主站与镜像站按 SEO 策略各自独立收录；开发站通配符 *.oc.schale.qzz.io 用于收录测试。
 */
const INDEXABLE_HOSTS: ReadonlySet<string> = new Set([
  'ccw.kivotos.qzz.io',
  'openccw.dpdns.org',
  'localhost',
  'openccw.lvh.me',
]);

/** 开发站域名后缀，整段通配放行 */
const DEV_HOST_SUFFIXES: readonly string[] = ['.oc.schale.qzz.io', '.dev.openccw.dpdns.org'];

/** 非白名单域名统一归一到的正式域名 */
const PRIMARY_HOST = 'ccw.kivotos.qzz.io';

/**
 * 全站基础安全响应头。
 * CSP 只声明不被内联脚本影响的指令，避免打断 SvelteKit 的水合脚本；
 * HSTS 在 HTTP 下会被浏览器忽略，本地开发无副作用。
 */
const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'SAMEORIGIN',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-security-policy': "frame-ancestors 'self'; base-uri 'self'; object-src 'none'",
  'strict-transport-security': 'max-age=31536000',
};

/**
 * 判断请求域名是否允许对外服务。
 * 非白名单域名会产生与主站重复的 canonical 内容，导致 Bing 等搜索引擎
 * 报「URL 无法索引」，必须 301 归一到主站。
 */
function isIndexableHost(host: string): boolean {
  const hostname = host.split(':')[0];
  return (
    INDEXABLE_HOSTS.has(hostname) ||
    DEV_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix) && hostname.length > suffix.length)
  );
}

/**
 * 注入 Cache-Control 激活 Cloudflare Crawler Hints，并将非白名单域名
 * 301 重定向到主站同路径，避免重复内容稀释 SEO。
 * @param event SvelteKit 请求事件
 * @param resolve 后续处理链
 */
export const handle: Handle = async ({ event, resolve }) => {
  if (!isIndexableHost(event.url.host)) {
    const target = new URL(event.request.url);
    target.protocol = 'https:';
    target.host = PRIMARY_HOST;
    return new Response(null, {
      status: 301,
      headers: { ...SECURITY_HEADERS, location: target.toString() },
    });
  }
  const headers: Record<string, string> = { ...SECURITY_HEADERS };
  if (event.request.method === 'GET' && SITEMAP_ROUTES.has(event.url.pathname)) {
    headers['cache-control'] = `public, max-age=${CACHE_MAX_AGE}, must-revalidate`;
  }
  event.setHeaders(headers);
  return resolve(event);
};
