/**
 * 校验并返回安全的 http(s) 链接
 * @param raw 原始链接
 * @returns 合法的绝对链接，非 http(s) 或无法解析时返回 null
 */
export function safeHttpUrl(raw?: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}
