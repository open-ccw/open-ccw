<script lang="ts">
  import { onMount } from "svelte";
  import bg from "#lib/assets/registerBG.webp";
  import {
    buildAuthorizeUrl,
    createPkcePair,
    pushAuthorizationRequest,
  } from "#lib/oauth/client.ts";
  import { completeOauthLogin } from "#lib/oauth/completeLogin.ts";
  import { OAUTH_REDIRECT_URI, setOauthPendingAuth } from "./oauthConfig";

  let error = $state("");
  let preparing = $state(true);
  let authorizeUrl = $state("");
  let pasted = $state("");
  let pastedError = $state("");
  let exchanging = $state(false);

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
      setOauthPendingAuth(state, pkce.codeVerifier);
      const requestUri = await pushAuthorizationRequest(
        OAUTH_REDIRECT_URI,
        state,
        pkce,
      );
      authorizeUrl = buildAuthorizeUrl(requestUri);
    } catch (e) {
      error = String(e);
    } finally {
      preparing = false;
    }
  });

  function openAuthorize(): void {
    window.open(authorizeUrl, "_blank", "noopener");
  }

  /** 解析用户粘贴的回调地址并完成登录 */
  async function submitPasted(): Promise<void> {
    pastedError = "";
    let code: string | null = null;
    let state: string | null = null;
    try {
      const url = new URL(pasted.trim());
      code = url.searchParams.get("code");
      state = url.searchParams.get("state");
      const errorParam = url.searchParams.get("error");
      if (errorParam) {
        pastedError = `授权失败: ${errorParam}`;
        return;
      }
    } catch {
      pastedError = "请粘贴完整的回调地址";
      return;
    }
    if (!code || !state) {
      pastedError = "回调地址中缺少 code 或 state 参数";
      return;
    }
    exchanging = true;
    try {
      const tokenSet = await completeOauthLogin(code, state);
      window.location.href = `/register?token=${encodeURIComponent(tokenSet.accessToken)}`;
    } catch (e) {
      pastedError = String(e);
    } finally {
      exchanging = false;
    }
  }
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
    {:else if preparing}
      <div
        class="mx-auto mb-6 w-12 h-12 border-4 border-gray-200 border-t-green-400 rounded-full animate-spin"
      ></div>
      <h2 class="text-2xl font-bold text-gray-800 mb-3">正在准备登录</h2>
      <p class="text-gray-500 text-sm">正在初始化 OAuth 授权请求...</p>
    {:else}
      <h2 class="text-2xl font-bold text-gray-800 mb-3">CCW 登录</h2>
      <ol
        class="text-left text-gray-500 text-sm leading-relaxed mb-6 space-y-1 list-decimal list-inside"
      >
        <li>点击下方按钮，在新标签页完成 CCW 授权登录</li>
        <li>
          授权后浏览器会跳转到一个
          <code class="text-xs bg-gray-100 rounded px-1">127.0.0.1</code>
          开头、打不开的页面，这是正常现象
        </li>
        <li>复制该页面地址栏的完整网址，粘贴到下方输入框</li>
        <li>点击"完成登录"</li>
      </ol>

      <button
        class="rounded-lg bg-green-500 text-white font-medium px-6 py-3 hover:bg-green-600 transition-colors cursor-pointer mb-6"
        onclick={openAuthorize}
      >
        前往 CCW 登录
      </button>

      <div class="flex flex-col gap-3 text-left">
        <textarea
          class="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 break-all"
          rows="3"
          placeholder="粘贴回调地址 (http://127.0.0.1:.../oauth/callback?code=...)"
          bind:value={pasted}
        ></textarea>
        {#if pastedError}
          <p class="text-red-500 text-sm break-all">{pastedError}</p>
        {/if}
        <button
          class="rounded-lg bg-gray-800 text-white font-medium px-6 py-3 hover:bg-gray-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onclick={submitPasted}
          disabled={exchanging || !pasted.trim()}
        >
          {exchanging ? "正在完成登录..." : "完成登录"}
        </button>
      </div>
    {/if}
  </div>
</div>
