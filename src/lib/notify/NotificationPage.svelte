<script lang="ts">
  import { communityWeb, type Notification } from '#lib/api.ts';
  import Error from '#lib/utils/Error.svelte';
  import { onMount } from 'svelte';
  import NotificationMessage from './NotificationMessage.svelte';
  import { token } from '#lib/auth/tokenStore';

  let { type = 'CREATION_INTERACTION' }: { type: Notification.NotificationGroup } = $props();
  let pageNum = $state(1);
  let totalPages = $state(Infinity);
  let error = $state('');
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
      error = '';
      const { data, totalPages: total } = await communityWeb.getNotification(type, {
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
  class="text-text-placeholder flex w-full flex-col items-center justify-center gap-2 py-4 text-sm"
>
  {#if loading}
    <span class="flex items-center gap-2">
      <span class="border-border border-t-info size-4 animate-spin rounded-full border-2"></span>
      <span>加载中...</span>
    </span>
    <p class="text-text-placeholder mx-auto max-w-3xl px-4 text-xs leading-relaxed">
      消息中心汇集了你在 CCW
      社区的全部动态通知：内容互动通知汇总作品收到的点赞、收藏与评论；回复通知帮你追踪每一条针对你的讨论；好友分享通知展示好友向你推荐的优质内容；系统消息则包含平台公告、账号安全提醒与审核结果。登录后即可在此统一查看与管理所有通知，不错过社区里的任何重要消息。
    </p>
  {:else if finished}
    <span>— 已加载全部消息 —</span>
  {:else}
    <span class="border-border size-4 rounded-full border-2"></span>
  {/if}
</footer>
