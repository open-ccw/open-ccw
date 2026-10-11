<script lang="ts">
  import { onMount } from "svelte";
  import bg from "$lib/assets/registerBG.webp";
  import {
    buildAuthorizeUrl,
    createPkcePair,
    pushAuthorizationRequest,
  } from "$lib/oauth/client";
  import {
    OAUTH_STATE_KEY,
    OAUTH_VERIFIER_KEY,
    oauthCallbackUrl,
  } from "./oauthConfig";

  let error = $state("");

  function randomState(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary)
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replace(/=+$/, "");
  }

  onMount(async () => {
    try {
      const state = randomState();
      const pkce = await createPkcePair();
      sessionStorage.setItem(OAUTH_STATE_KEY, state);
      sessionStorage.setItem(OAUTH_VERIFIER_KEY, pkce.codeVerifier);
      const requestUri = await pushAuthorizationRequest(
        oauthCallbackUrl(),
        state,
        pkce,
      );
      document.location.href = buildAuthorizeUrl(requestUri);
    } catch (e) {
      error = String(e);
    }
  });
</script>

<svelte:head>
  <title>正在跳转 CCW 登录 — Open CCW</title>
  <meta name="robots" content="noindex, nofollow" />
  <meta
    name="description"
    content="Open CCW OAuth 授权登录页面，即将重定向至 CCW 社区进行身份验证，授权完成后自动获取 Token 并完成注册绑定，安全便捷的第三方登录方式。"
  />
</svelte:head>

<div
  class="w-screen h-screen min-h-fit flex items-center justify-center"
  style:background="url({bg}) repeat center/cover"
>
  <div class="bg-white w-lg h-fit rounded-2xl p-10 shadow-xl text-center">
    {#if error}
      <div class="text-center">
        <div
          class="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center"
        >
          <span class="text-2xl text-red-500 font-bold">!</span>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-3">授权发起失败</h2>
        <p class="text-gray-500 text-sm mb-6 break-all">{error}</p>
        <a
          href="/"
          class="inline-block rounded-lg bg-gray-200 text-gray-700 font-medium px-6 py-3 hover:bg-gray-300 transition-colors"
        >
          返回首页
        </a>
      </div>
    {:else}
      <div
        class="mx-auto mb-6 w-12 h-12 border-4 border-gray-200 border-t-green-400 rounded-full animate-spin"
      ></div>
      <h2 class="text-2xl font-bold text-gray-800 mb-3">正在跳转到 CCW 登录</h2>
      <p class="text-gray-500 text-sm">
        即将重定向至 CCW OAuth 授权页面，请稍候...
      </p>
    {/if}
  </div>
</div>
