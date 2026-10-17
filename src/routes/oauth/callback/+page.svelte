<script lang="ts">
  import { onMount } from 'svelte';
  import bg from '#lib/assets/registerBG.webp';
  import { completeOauthLogin } from '#lib/oauth/completeLogin.ts';

  let error = $state('');
  let loading = $state(true);

  onMount(async () => {
    const url = new URL(location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const errorParam = url.searchParams.get('error');
    if (!code || !state) {
      error = errorParam ? `授权失败: ${errorParam}` : '回调地址缺少授权参数，请返回重新登录';
      loading = false;
      return;
    }
    try {
      const tokenSet = await completeOauthLogin(code, state);
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
  <meta
    name="description"
    content="Open CCW OAuth 授权回调处理页面，正在验证授权信息并完成 Token 获取，验证通过后将自动跳转至注册页面完成账号绑定。"
  />
</svelte:head>

<div
  class="flex h-screen min-h-fit w-screen items-center justify-center"
  style:background="url({bg}) repeat center/cover"
>
  <div class="w-lg rounded-2xl bg-white p-10 shadow-xl">
    {#if error}
      <div class="text-center">
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100"
        >
          <span class="text-2xl font-bold text-red-500">!</span>
        </div>
        <h2 class="mb-3 text-2xl font-bold text-gray-800">授权失败</h2>
        <p class="mb-6 text-sm break-all text-gray-500">{error}</p>
        <a
          href="/"
          class="inline-block rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
        >
          返回首页
        </a>
      </div>
    {:else if loading}
      <div class="text-center">
        <div
          class="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-400"
        ></div>
        <h2 class="mb-3 text-2xl font-bold text-gray-800">正在完成授权</h2>
        <p class="text-sm text-gray-500">正在验证授权信息，请稍候...</p>
      </div>
    {/if}
  </div>
</div>
