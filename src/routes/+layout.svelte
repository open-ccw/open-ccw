<script lang="ts">
  import './layout.css';
  import favicon from '#lib/assets/favicon.svg';
  import '#lib/api.ts';
  let { children } = $props();

  import { onMount } from 'svelte';
  import { dev } from '$app/env';
  import { browser } from '$app/env';
  import { refreshTokenIfExpired, startTokenRefreshTimer } from '#lib/oauth/refresh.ts';
  import { applyDevTokenFromUrl } from '#lib/oauth/devToken.ts';
  import { resolveAuthStatus } from '#lib/user/userStore.ts';
  import ToastHost from '#lib/toast/ToastHost.svelte';
  import SiteFooter from '#lib/SiteFooter.svelte';

  if (browser && origin !== 'null' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js', {
      type: dev ? 'module' : 'classic',
    });
  }

  onMount(async () => {
    // 开发/preview 的临时 token 只用于调试，不参与 refresh 续期
    if (await applyDevTokenFromUrl().catch(() => false)) {
      resolveAuthStatus();
      return;
    }
    // 会话恢复结束后再确定登录态；加载中的用户信息由 updateUser 自行决定
    refreshTokenIfExpired()
      .catch(() => {})
      .finally(resolveAuthStatus);
    startTokenRefreshTimer();
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <meta name="robots" content="index, follow" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Open CCW" />
  <meta property="og:locale" content="zh_CN" />
  <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
</svelte:head>
<ToastHost />
{@render children()}
<SiteFooter />
