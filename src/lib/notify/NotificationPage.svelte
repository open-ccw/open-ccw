<script lang="ts">
  import { communityWeb, type Notification } from "#lib/api.ts";
  import Error from "#lib/utils/Error.svelte";
  import { onMount } from "svelte";
  import NotificationMessage from "./NotificationMessage.svelte";
  import { token } from "#lib/auth/tokenStore";

  let {
    type = "CREATION_INTERACTION",
  }: { type: Notification.NotificationGroup } = $props();
  let pageNum = $state(1);
  let totalPages = $state(Infinity);
  let error = $state("");
  let pages: Notification.NotificationPage[] = $state.raw([]);
  let loading = $state(false);
  let footer: HTMLElement | null = $state(null);
  let observer: null | IntersectionObserver = $state(null);

  // 是否还有更多可加载（pageNum 尚未超过 totalPages）
  let hasMore = $derived(pageNum <= totalPages);
  // 是否已全部加载完
  let finished = $derived(!loading && !hasMore);

  async function refresh() {
    if (loading || !hasMore) {
      return;
    }
    loading = true;
    try {
      error = "";
      const { data, totalPages: total } =
        await communityWeb.getNotificationPage(type, {
          perPage: 20,
          page: pageNum,
        });
      if (total > 0) {
        totalPages = total;
      }

      pages = pages.concat(...data);
      pageNum += 1;

      // 返回空列表视为没有更多，防止未知总数时无限加载
      if (data.length === 0) {
        totalPages = pageNum - 1;
      }
    } catch (e) {
      error = String(e);
    }
    loading = false;
  }

  $effect(() => {
    if (footer && observer) {
      observer.observe(footer);
    }
  });

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          refresh();
        }
      },
      {
        threshold: 0.1,
      },
    );
    // 主动加载第一页，避免首屏内容不足导致无法触发观察器
    refresh();
  });

  $effect(() => {
    if ($token) {
      // 解决refresh内部修改state导致effect反复刷新
      setTimeout(refresh, 10);
    }
  });
</script>

<Error {error}></Error>
{#each pages as page}
  <NotificationMessage {page}></NotificationMessage>
{/each}

<footer
  bind:this={footer}
  class="w-full flex items-center justify-center gap-2 py-4 text-sm text-text-placeholder"
>
  {#if loading}
    <span
      class="size-4 border-2 border-border border-t-info rounded-full animate-spin"
    ></span>
    <span>加载中...</span>
  {:else if finished}
    <span>— 已加载全部消息 —</span>
  {:else}
    <span class="size-4 border-2 border-border rounded-full"></span>
  {/if}
</footer>
