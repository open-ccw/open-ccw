<script lang="ts">
  import { onMount } from "svelte";
  import bg from "$lib/assets/registerBG.webp";
  import { exchangeAuthorizationCode } from "$lib/oauth/client";
  import {
    OAUTH_STATE_KEY,
    OAUTH_VERIFIER_KEY,
    oauthCallbackUrl,
  } from "../oauthConfig";

  let error = $state("");
  let loading = $state(true);

  onMount(async () => {
    const url = new URL(location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);
    const codeVerifier = sessionStorage.getItem(OAUTH_VERIFIER_KEY);

    if (!code || !state || !expectedState || state !== expectedState) {
      error = "安全校验未通过 (state 不匹配)，请返回重新登录";
      loading = false;
      return;
    }
    if (!codeVerifier) {
      error = "缺少 PKCE 校验信息，请返回重新登录";
      loading = false;
      return;
    }
    try {
      const tokenSet = await exchangeAuthorizationCode(
        code,
        oauthCallbackUrl(),
        codeVerifier,
      );
      sessionStorage.removeItem(OAUTH_STATE_KEY);
      sessionStorage.removeItem(OAUTH_VERIFIER_KEY);
      if (tokenSet.refreshToken) {
        sessionStorage.setItem(
          "oc_oauth_refresh",
          JSON.stringify({
            refreshToken: tokenSet.refreshToken,
            expiresAt: tokenSet.expiresAt,
          }),
        );
      }
      window.location.href = `/register?token=${encodeURIComponent(tokenSet.accessToken)}`;
    } catch (e) {
      error = String(e);
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>OAuth 授权回调 — Open CCW</title>
  <meta name="robots" content="noindex, nofollow" />
  <meta name="description" content="Open CCW OAuth 授权回调处理页面，正在验证授权信息并完成 Token 获取，验证通过后将自动跳转至注册页面完成账号绑定。" />
</svelte:head>

<div
  class="w-screen h-screen min-h-fit flex items-center justify-center"
  style:background="url({bg}) repeat center/cover"
>
  <div class="bg-white w-lg rounded-2xl p-10 shadow-xl">
    {#if error}
      <div class="text-center">
        <div
          class="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center"
        >
          <span class="text-2xl text-red-500 font-bold">!</span>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-3">授权失败</h2>
        <p class="text-gray-500 text-sm mb-6 break-all">{error}</p>
        <a
          href="/"
          class="inline-block rounded-lg bg-gray-200 text-gray-700 font-medium px-6 py-3 hover:bg-gray-300 transition-colors"
        >
          返回首页
        </a>
      </div>
    {:else if loading}
      <div class="text-center">
        <div
          class="mx-auto mb-6 w-12 h-12 border-4 border-gray-200 border-t-green-400 rounded-full animate-spin"
        ></div>
        <h2 class="text-2xl font-bold text-gray-800 mb-3">正在完成授权</h2>
        <p class="text-gray-500 text-sm">正在验证授权信息，请稍候...</p>
      </div>
    {:else}
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-800">处理中...</h2>
      </div>
    {/if}
  </div>
</div>
