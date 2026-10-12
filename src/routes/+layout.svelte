<script lang="ts">
  import "./layout.css";
  import favicon from "#lib/assets/favicon.svg";
  import "#lib/api";
  let { children } = $props();

  import { onMount } from "svelte";
  import { dev } from "$app/environment";
  import { browser } from "$app/env";
  import { refreshTokenIfExpired } from "#lib/oauth/refresh";
  import ToastHost from "#lib/toast/ToastHost.svelte";

  if (browser && origin !== "null" && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js", {
      type: dev ? "module" : "classic",
    });
  }

  onMount(() => {
    refreshTokenIfExpired().catch(() => {});
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
