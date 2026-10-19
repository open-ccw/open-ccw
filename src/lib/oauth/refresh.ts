import { get } from 'svelte/store';
import { refreshAccessToken } from './client';
import {
  getAccountRefresh,
  getActiveAccount,
  setAccountRefresh,
  token,
} from '#lib/auth/tokenStore';
import { setToken } from '#lib/api.ts';
import { refreshUser } from '#lib/user/userStore.ts';
import { toast } from '#lib';

/** 提前 30 秒视为过期 */
const EXPIRY_SKEW_MS = 30_000;

function currentToken(): string {
  return get(token);
}

/**
 * 若账号 token 已过期或即将过期，用其 refresh token 换新。
 * 刷新失败时静默返回原 token，由后续请求暴露错误。
 *
 * @param name 账号名
 * @param tok 当前 token
 * @returns 可用的新 token（未过期或刷新失败时为原 token）
 */
export async function freshTokenFor(name: string, tok: string): Promise<string> {
  const record = await getAccountRefresh(name);
  if (!record?.refreshToken || record.expiresAt - EXPIRY_SKEW_MS > Date.now()) {
    return tok;
  }
  try {
    const tokens = await refreshAccessToken(record.refreshToken);
    await setAccountRefresh(name, tokens.refreshToken ?? record.refreshToken, tokens.expiresAt);
    return tokens.accessToken;
  } catch {
    toast.error('登录凭证刷新失败，部分功能可能暂不可用');
    return tok;
  }
}

/**
 * 若当前活跃账号的 OAuth token 已过期，
 * 刷新会话 token 并重新拉取用户信息。
 *
 * @returns 是否实际执行了刷新
 */
export async function refreshTokenIfExpired(): Promise<boolean> {
  const name = getActiveAccount();
  if (!name) {
    return false;
  }
  const tok = currentToken();
  if (!tok) {
    return false;
  }
  const fresh = await freshTokenFor(name, tok);
  if (fresh === tok) {
    return false;
  }
  setToken(fresh);
  token.set(fresh);
  await refreshUser().catch(() => {});
  return true;
}

/** 定时刷新间隔：5 分钟检查一次 */
const REFRESH_CHECK_INTERVAL_MS = 5 * 60 * 1000;

let refreshTimerStarted = false;

/**
 * 启动定时刷新：页面加载后立即检查一次活跃账号 token 并尝试续期，
 * 之后周期检查，页面从后台切回时也立即检查。仅在浏览器环境且只启动一次。
 */
export function startTokenRefreshTimer(): void {
  if (refreshTimerStarted) {
    return;
  }
  refreshTimerStarted = true;
  // 页面加载后立即尝试刷新一次，不受上一次刷新结果影响
  refreshTokenIfExpired().catch(() => {});
  setInterval(() => {
    refreshTokenIfExpired().catch(() => {});
  }, REFRESH_CHECK_INTERVAL_MS);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      refreshTokenIfExpired().catch(() => {});
    }
  });
}
