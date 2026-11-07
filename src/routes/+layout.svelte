<script lang="ts">
  import './layout.css';
  import favicon from '#lib/assets/favicon.svg';
  import '#lib/api.ts';
  let { children } = $props();

  import { onMount } from 'svelte';
  import { dev } from '$app/env';
  import { browser } from '$app/env';
  import { refreshTokenIfExpired, startTokenRefreshTimer } from '#lib/oauth/refresh.ts';
  import ToastHost from '#lib/toast/ToastHost.svelte';
  import SiteFooter from '#lib/SiteFooter.svelte';

  if (browser && origin !== 'null' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js', {
      type: dev ? 'module' : 'classic',
    });
  }

  onMount(() => {
    refreshTokenIfExpired().catch(() => {});
    startTokenRefreshTimer();
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <meta name="robots" content="index, follow" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Open CCW" />
  <meta property="og:locale" content="zh_CN" />
</svelte:head>
<ToastHost />
{@render children()}
<SiteFooter />
