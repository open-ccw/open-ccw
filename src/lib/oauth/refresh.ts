import { get } from 'svelte/store';
import { refreshAccessToken, OAuthError, type TokenSet } from './client';
import {
  getAccountRefresh,
  getActiveAccount,
  setAccountRefresh,
  clearAccountRefresh,
  token,
  type AccountTokenRefresh,
} from '#lib/auth/tokenStore';
import { setToken } from '#lib/api.ts';
import { refreshUser } from '#lib/user/userStore.ts';
import { toast } from '#lib';

/** 提前 30 秒视为过期 */
const EXPIRY_SKEW_MS = 30_000;

/** 每账号的单飞刷新 Promise：并发调用共享同一次刷新，避免 refresh_token 轮换后被旧值作废 */
const refreshInFlight = new Map<string, Promise<TokenSet>>();

function currentToken(): string {
  return get(token);
}

/**
 * 执行刷新并把（可能轮换的）refresh token 落盘。
 * 失败时区分 invalid_grant（refresh token 已失效，清理记录并提示重登）
 * 与网络等可恢复错误（保留会话，等待下次重试）。
 */
async function runRefresh(name: string, record: AccountTokenRefresh): Promise<TokenSet> {
  try {
    const tokens = await refreshAccessToken(record.refreshToken);
    await setAccountRefresh(name, tokens.refreshToken ?? record.refreshToken, tokens.expiresAt);
    return tokens;
  } catch (e) {
    if (e instanceof OAuthError && e.code === 'invalid_grant') {
      clearAccountRefresh(name);
      toast.error('登录已过期，请重新登录');
    } else {
      toast.error('登录凭证刷新失败，部分功能可能暂不可用');
    }
    throw e;
  }
}

/**
 * 获取账号的可用 token：过期（或 tok 为空）时走单飞刷新。
 * 刷新失败时返回原 tok，由后续请求暴露错误。
 *
 * @param name 账号名
 * @param tok 当前 token，为空字符串时视为需要恢复会话，强制刷新
 * @returns 可用的新 token（未过期或刷新失败时为原 tok）
 */
export async function freshTokenFor(name: string, tok: string): Promise<string> {
  const record = await getAccountRefresh(name);
  // tok 为空说明 sessionStorage 丢失但 refresh 记录还在，需要用 RT 恢复会话
  if (!record?.refreshToken || (tok && record.expiresAt - EXPIRY_SKEW_MS > Date.now())) {
    return tok;
  }
  const existing = refreshInFlight.get(name);
  if (existing) {
    try {
      return (await existing).accessToken;
    } catch {
      return tok;
    }
  }
  const flight = runRefresh(name, record).finally(() => refreshInFlight.delete(name));
  refreshInFlight.set(name, flight);
  try {
    return (await flight).accessToken;
  } catch {
    return tok;
  }
}

/**
 * 若当前活跃账号 token 过期或缺失，用 refresh token 刷新并恢复会话。
 * token 为空但 refresh 记录有效时也会执行刷新（重开标签页后的会话恢复）。
 *
 * @returns 是否实际执行了刷新
 */
export async function refreshTokenIfExpired(): Promise<boolean> {
  const name = getActiveAccount();
  if (!name) {
    return false;
  }
  const tok = currentToken();
  const record = await getAccountRefresh(name);
  if (!record?.refreshToken) {
    return false;
  }
  const needRefresh = !tok || record.expiresAt - EXPIRY_SKEW_MS <= Date.now();
  if (!needRefresh) {
    return false;
  }
  const fresh = await freshTokenFor(name, tok);
  if (!fresh || fresh === tok) {
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
 * 启动定时刷新：页面加载后立即检查一次活跃账号 token 并尝试续期或恢复会话，
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
