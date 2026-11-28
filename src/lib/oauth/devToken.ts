import { browser, dev } from '$app/env';
import { updateToken, clearTokenAndUser } from '#lib/user/userStore.ts';
import { toast } from '#lib';

/** 预览环境域名后缀（Cloudflare 预览构建） */
const PREVIEW_SUFFIXES = ['.oc.schale.qzz.io', '.dev.openccw.dpdns.org', '.workers.dev'];

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

/**
 * 读取 URL 中的开发临时 token 并完成登录。
 * 仅支持 `?dev_token=<access token>` 直接注入：token 只写内存/会话存储，
 * 不获取 refresh token 也不会自动续期；仅在开发或 preview 环境生效，
 * 成功后立即从地址栏移除参数，避免 token 残留在历史记录中。
 *
 * @returns 是否成功应用了临时 token
 */
export async function applyDevTokenFromUrl(): Promise<boolean> {
  if (!browser || !(dev || isDevPreviewHost(location.hostname))) {
    return false;
  }
  const url = new URL(location.href);
  const accessToken = url.searchParams.get('dev_token');
  if (!accessToken) {
    return false;
  }

  try {
    devTokenSession = true;
    await updateToken(accessToken);
    url.searchParams.delete('dev_token');
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
