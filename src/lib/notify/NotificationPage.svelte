<script lang="ts">
  import { communityWeb } from '#lib/api.ts';
  import { toast } from '#lib';
  import Error from '#lib/utils/Error.svelte';
  import { onMount } from 'svelte';
  import NotificationMessage from './NotificationMessage.svelte';
  import { token } from '#lib/auth/tokenStore';
  import { markNotificationRead } from '#lib/notify/notifyStatsStore.ts';
  import type { NotificationV3Group, NotificationV3Item } from '#lib/notify/types.ts';

  type LegacyGroup = 'CREATION_INTERACTION' | 'COMMENT_TO_ME' | 'FRIEND_SHARE' | 'WEB_SYSTEM';

  const GROUP_MAP: Record<LegacyGroup, NotificationV3Group> = {
    CREATION_INTERACTION: 'CONTENT_INTERACTION',
    COMMENT_TO_ME: 'REPLY',
    FRIEND_SHARE: 'FRIEND_SHARE',
    WEB_SYSTEM: 'SYSTEM',
  };

  let { type = 'CREATION_INTERACTION' }: { type: NotificationV3Group | LegacyGroup } = $props();

  const group = $derived<NotificationV3Group>(
    type in GROUP_MAP ? GROUP_MAP[type as LegacyGroup] : (type as NotificationV3Group),
  );

  let cursor: null | string = null;
  let hasMore = $state(true);
  let error = $state('');
  let pages: NotificationV3Item[] = $state.raw([]);
  let loading = $state(false);
  let footer: HTMLElement | null = $state(null);
  let observer: null | IntersectionObserver = $state(null);
  let refreshTimer: ReturnType<typeof setTimeout> | null = null;

  let canLoadMore = $derived(hasMore && !loading);
  let finished = $derived(!loading && !hasMore);

  async function refresh() {
    if (!canLoadMore) {
      return;
    }
    loading = true;
    try {
      error = '';
      const {
        items,
        hasMore: more,
        nextCursor,
        readToken,
      } = await communityWeb.getNotificationV3Page(group, 'ALL', cursor, 20);
      pages = pages.concat(items);
      hasMore = more;
      cursor = nextCursor;
      if (readToken && items.some((item) => item.readState === 'UNREAD')) {
        try {
          await markNotificationRead(group, readToken);
          const loadedIds = new Set(items.map((item) => item.id));
          pages = pages.map((item) =>
            loadedIds.has(item.id) ? { ...item, readState: 'READ' } : item,
          );
        } catch (e) {
          toast.error(`通知已读标记失败：${String(e)}`);
        }
      }
    } catch (e) {
      error = String(e);
    } finally {
      loading = false;
    }
  }

  function reset() {
    pages = [];
    cursor = null;
    hasMore = true;
    error = '';
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
      { threshold: 0.1 },
    );
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      observer?.disconnect();
    };
  });

  $effect(() => {
    group;
    reset();
    if ($token) {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      refreshTimer = setTimeout(refresh, 10);
    }
  });
</script>

<Error {error}></Error>
{#each pages as page}
  <NotificationMessage {page}></NotificationMessage>
{/each}

<footer
  bind:this={footer}
  class="text-text-placeholder flex w-full items-center justify-center gap-2 py-4 text-sm"
>
  {#if loading}
    <span class="border-border border-t-info size-4 animate-spin rounded-full border-2"></span>
    <span>加载中...</span>
  {:else if finished}
    <span>— 已加载全部消息 —</span>
  {:else}
    <span class="border-border size-4 rounded-full border-2"></span>
  {/if}
</footer>
