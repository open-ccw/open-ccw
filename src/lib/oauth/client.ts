import { createDpopProof, getDeviceId, getJkt } from './dpop';
import {
  OAUTH_ENDPOINTS,
  OAUTH_PROXY_ENDPOINTS,
  OAUTH_SCOPE,
  OAUTH_CLIENT_ID,
  STEP_UP_URL,
} from '../../routes/oauth/oauthConfig';

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  /** 过期时间戳（毫秒） */
  expiresAt: number;
  scope?: string;
}

export interface PkcePair {
  codeVerifier: string;
  codeChallenge: string;
}

/** OAuth 协议错误，code 携带服务端 error（如 invalid_grant）用于区分可恢复与不可恢复失败 */
export class OAuthError extends Error {
  constructor(
    public code: string,
    message?: string,
    public detail?: string,
  ) {
    super(message ?? code);
    this.name = 'OAuthError';
  }
}

function b64url(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

async function sha256(input: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
}

/** 生成 PKCE code_verifier / code_challenge (S256) 对 */
export async function createPkcePair(): Promise<PkcePair> {
  const codeVerifier = b64url(crypto.getRandomValues(new Uint8Array(32)));
  return {
    codeVerifier,
    codeChallenge: b64url(await sha256(codeVerifier)),
  };
}

/**
 * POST 表单请求到 CCW SSO（经本站代理转发）。
 * DPoP proof 使用真实上游 URL 签名，代理原样转发头与请求体。
 * @param proxyUrl 本站代理端点
 * @param upstreamUrl 真实上游端点（用于 DPoP htu）
 */
async function postForm(
  proxyUrl: string,
  upstreamUrl: string,
  params: Record<string, string>,
  boundToken?: string,
): Promise<unknown> {
  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Upstream-Url': upstreamUrl,
      DPoP: await createDpopProof('POST', upstreamUrl, boundToken),
    },
    body: new URLSearchParams(params),
  });
  const text = await response.text();
  let payload: Record<string, unknown> | null = null;
  try {
    payload = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const code = payload?.error;
    const description = payload?.error_description;
    throw new OAuthError(
      typeof code === 'string' ? code : `http_${response.status}`,
      typeof description === 'string' ? description : undefined,
      `${new URL(proxyUrl).pathname} -> ${response.status}`,
    );
  }
  return payload;
}

/** 校验 token 响应并转换为 TokenSet */
function toTokenSet(payload: unknown): TokenSet {
  const data = payload as Record<string, unknown> | null;
  const accessToken = (data?.access_token as string) ?? (data?.accessToken as string);
  if (!accessToken) {
    throw new Error('OAuth 响应中缺少 access token');
  }
  const tokenType = (data?.token_type as string) ?? (data?.tokenType as string);
  if ((tokenType ?? '').toLowerCase() !== 'dpop') {
    throw new Error(`不支持的 token 类型: ${tokenType || '(缺失)'}`);
  }
  const expiresIn = Number(data?.expires_in ?? data?.expiresIn ?? 900);
  return {
    accessToken,
    refreshToken: (data?.refresh_token as string) ?? (data?.refreshToken as string),
    expiresAt: Date.now() + expiresIn * 1000,
    scope: data?.scope as string | undefined,
  };
}

/**
 * Pushed Authorization Request (PAR)。
 * @param redirectUri 本站回调地址
 * @param state 随机 state
 * @param pkce PKCE 对
 * @returns authorize 用的 request_uri
 */
export async function pushAuthorizationRequest(
  redirectUri: string,
  state: string,
  pkce: PkcePair,
): Promise<string> {
  const payload = (await postForm(OAUTH_PROXY_ENDPOINTS.par, OAUTH_ENDPOINTS.par, {
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: OAUTH_SCOPE,
    state,
    code_challenge: pkce.codeChallenge,
    code_challenge_method: 'S256',
    dpop_jkt: await getJkt(),
    device_id: await getDeviceId(),
  })) as { request_uri?: string } | null;
  if (!payload?.request_uri) {
    throw new Error('PAR 响应中缺少 request_uri');
  }
  return payload.request_uri;
}

/** 构造跳转浏览器的授权 URL（step-up 包裹 authorize） */
export function buildAuthorizeUrl(requestUri: string): string {
  const authorizeUrl = new URL(OAUTH_ENDPOINTS.authorize);
  authorizeUrl.searchParams.set('client_id', OAUTH_CLIENT_ID);
  authorizeUrl.searchParams.set('request_uri', requestUri);
  const browserUrl = new URL(STEP_UP_URL);
  browserUrl.searchParams.set('return_to', authorizeUrl.toString());
  return browserUrl.toString();
}

/**
 * 用授权码换取 token。
 * @param code 授权码
 * @param redirectUri 本站回调地址（须与 PAR 一致）
 * @param codeVerifier PKCE code_verifier
 */
export async function exchangeAuthorizationCode(
  code: string,
  redirectUri: string,
  codeVerifier: string,
): Promise<TokenSet> {
  return toTokenSet(
    await postForm(OAUTH_PROXY_ENDPOINTS.token, OAUTH_ENDPOINTS.token, {
      grant_type: 'authorization_code',
      client_id: OAUTH_CLIENT_ID,
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  );
}

/**
 * 用 refresh token 刷新 token。
 * @param refreshToken 刷新令牌
 * @returns TokenSet（响应未含新 refresh token 时需由调用方沿用旧值）
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenSet> {
  return toTokenSet(
    await postForm(OAUTH_PROXY_ENDPOINTS.token, OAUTH_ENDPOINTS.token, {
      grant_type: 'refresh_token',
      client_id: OAUTH_CLIENT_ID,
      refresh_token: refreshToken,
    }),
  );
}

/**
 * 撤销 refresh token（登出 OAuth 账号）。
 * DPoP proof 绑定被撤销的 token（ath）。
 * @param refreshToken 待撤销的刷新令牌
 */
export async function revokeOauthToken(refreshToken: string): Promise<void> {
  await postForm(
    OAUTH_PROXY_ENDPOINTS.revoke,
    OAUTH_ENDPOINTS.revoke,
    { token: refreshToken },
    refreshToken,
  );
}
