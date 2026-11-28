import { browser, dev } from '$app/env';
import { updateToken, clearTokenAndUser } from '#lib/user/userStore.ts';
import { toast } from '#lib';

/** 主站地址：负责校验登录态并把 access token 交回开发环境 */
const MAIN_ORIGIN = 'https://ccw.kivotos.qzz.io';

/** 预览环境域名后缀（Cloudflare 预览构建） */
const PREVIEW_SUFFIXES = ['.oc.schale.qzz.io', '.dev.openccw.dpdns.org'];

/** 当前会话是否来自开发临时 token：为 true 时禁用 refresh 续期 */
let devTokenSession = false;

/** 当前是否为开发临时 token 会话（不获取也不刷新 refresh token） */
export function isDevTokenSession(): boolean {
  return devTokenSession;
}

/** 判断主机是否属于开发或 preview 环境 */
export function isDevPreviewHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.lvh.me') ||
    PREVIEW_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
  );
}

/** 用临时 token 完成登录，并清理地址栏中携带的 token */
async function applyToken(accessToken: string, clearParams: (url: URL) => void): Promise<boolean> {
  const url = new URL(location.href);
  try {
    devTokenSession = true;
    await updateToken(accessToken);
    clearParams(url);
    history.replaceState(history.state, '', url);
    toast.info('已使用开发临时 Token 登录，该会话不会自动续期');
    return true;
  } catch (e) {
    devTokenSession = false;
    // token 无效时 updateToken 已写入内存但拉取用户失败，这里回滚避免留下半登录状态
    clearTokenAndUser();
    toast.error(`开发临时 Token 无效：${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}

/** 跳转主站开发授权页，由主站读取登录态后带 token 回跳本页 */
function redirectToMain(callbackUrl: string): void {
  const target = new URL('/oauth/dev-token', MAIN_ORIGIN);
  target.searchParams.set('redirect_uri', callbackUrl);
  location.replace(target.toString());
}

/**
 * 开发环境登录入口，支持三种方式：
 * 1. 主站回跳：地址 fragment 中带 `dev_token`（由主站授权页写入，不经过服务器日志）
 * 2. `?dev_auth`：跳转主站授权页，登录后自动带 token 回到当前页面
 * 3. `?dev_token=<access token>`：直接注入
 *
 * 仅在开发/preview 环境生效；token 只用于本次会话，不获取也不刷新 refresh token。
 *
 * @returns 是否成功应用了临时 token
 */
export async function applyDevTokenFromUrl(): Promise<boolean> {
  if (!browser || !(dev || isDevPreviewHost(location.hostname))) {
    return false;
  }
  const url = new URL(location.href);

  const hashToken = new URLSearchParams(url.hash.replace(/^#/, '')).get('dev_token');
  if (hashToken) {
    return applyToken(hashToken, (u) => {
      u.hash = '';
    });
  }

  const directToken = url.searchParams.get('dev_token');
  if (directToken) {
    return applyToken(directToken, (u) => {
      u.searchParams.delete('dev_token');
    });
  }

  if (url.searchParams.has('dev_auth')) {
    const callback = new URL(location.href);
    callback.searchParams.delete('dev_auth');
    callback.searchParams.delete('dev_token');
    callback.hash = '';
    // 先清掉 dev_auth，避免从主站返回后再次触发跳转
    url.searchParams.delete('dev_auth');
    history.replaceState(history.state, '', url);
    redirectToMain(callback.toString());
  }

  return false;
}
