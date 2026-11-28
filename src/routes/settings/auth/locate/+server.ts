import { error, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export interface LocateRes {
  ret: number;
  data: {
    ip: string;
    country: string;
    country_code: string;
    prov: string;
    city: string;
    city_code: string;
    city_short_code: string;
    area: string;
    post_code: string;
    area_code: string;
    isp: string;
    lng: string;
    lat: string;
    long_ip: 0;
    big_area: string;
  };
  qt: 0;
}

/** 仅允许 IPv4 / IPv6 字面量，避免任意字符串被拼进上游查询参数 */
function isIpLiteral(value: string): boolean {
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    return value.split('.').every((part) => Number(part) <= 255);
  }
  return value.includes(':') && value.length <= 45 && /^[0-9a-fA-F:]+$/.test(value);
}

export const POST: RequestHandler = async ({ request }) => {
  const body = (await request.json().catch(() => ({}))) as { ip?: string };
  if (!body.ip || !isIpLiteral(body.ip)) {
    return error(400, 'invalid ip');
  }
  const upstream = new URL('https://ip9.com.cn/get');
  upstream.searchParams.set('ip', body.ip);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(upstream, { signal: controller.signal });
    if (!res.ok) {
      return error(502, '定位服务不可用');
    }
    return text(await res.text());
  } catch {
    return error(504, '定位服务超时');
  } finally {
    clearTimeout(timer);
  }
};
