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
  <meta name="og:type" content="website" />
  <meta name="og:site_name" content="Open CCW" />
  <meta name="og:locale" content="zh_CN" />
</svelte:head>
<ToastHost />
{@render children()}
