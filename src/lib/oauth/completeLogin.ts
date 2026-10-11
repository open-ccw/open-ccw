import { exchangeAuthorizationCode, type TokenSet } from "./client";
import {
  OAUTH_PENDING_REFRESH_KEY,
  OAUTH_REDIRECT_URI,
  clearOauthPendingAuth,
  getOauthPendingAuth,
} from "../../routes/oauth/oauthConfig";

/**
 * 校验 state 并用授权码换取 token。
 * 成功后清除待授权信息，并将 refresh 记录暂存 sessionStorage 供注册页绑定账号。
 * @param code 授权码（来自回调 URL 或用户粘贴的回调地址）
 * @param state 授权码携带的 state
 * @returns TokenSet
 */
export async function completeOauthLogin(
  code: string,
  state: string,
): Promise<TokenSet> {
  const pending = getOauthPendingAuth();
  if (!pending || state !== pending.state) {
    throw new Error("安全校验未通过 (state 不匹配)，请返回重新登录");
  }
  const tokenSet = await exchangeAuthorizationCode(
    code,
    OAUTH_REDIRECT_URI,
    pending.verifier,
  );
  clearOauthPendingAuth();
  if (tokenSet.refreshToken) {
    sessionStorage.setItem(
      OAUTH_PENDING_REFRESH_KEY,
      JSON.stringify({
        refreshToken: tokenSet.refreshToken,
        expiresAt: tokenSet.expiresAt,
      }),
    );
  }
  return tokenSet;
}
