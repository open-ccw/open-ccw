<script lang="ts">
  import PageHeader from '#lib/PageHeader.svelte';
  import { onMount, type Snippet } from 'svelte';
  import { noticeTypes } from './noticeTypes';
  import Error from '#lib/utils/Error.svelte';
  import { goto } from '$app/navigation';
  import { token } from '#lib/auth/tokenStore.ts';
  import { toast } from '#lib';
  import {
    notificationSummary,
    refreshNotificationSummary,
    getGroupUnread,
    markAllNotificationsRead,
  } from '#lib/notify/notifyStatsStore.ts';

  let { children }: { children: Snippet } = $props();

  let selectedId: number = $state(-1);
  let error = $state('');
  let markingAll = $state(false);

  async function handleMarkAllRead() {
    if (markingAll) {
      return;
    }
    markingAll = true;
    try {
      const changed = await markAllNotificationsRead();
      if (changed) {
        toast.success('已全部标为已读');
      } else {
        toast.info('暂无未读消息');
      }
    } catch (e) {
      toast.error(`全标已读失败：${String(e)}`);
    } finally {
      markingAll = false;
    }
  }
  // 按标签页对应的 v3 分组汇总未读数
  let counts = $derived.by(() => {
    if (!$notificationSummary) {
      return;
    }
    return noticeTypes.map(({ groups }) =>
      groups.reduce((sum, group) => sum + getGroupUnread($notificationSummary, group), 0),
    );
  });

  onMount(() => {
    try {
      const url = new URL(document.URL);
      const type = url.pathname.split('/')[2];

      if (!type) {
        throw '消息类型错误';
      }
      selectedId = noticeTypes.findIndex((t) => t.type == type);
      if (selectedId < 0) {
        throw '消息类型错误';
      }
    } catch (e) {
      error = String(e);
    }
  });
</script>

<svelte:head>
  <title>消息中心 - Open CCW | 查看互动、回复、分享与系统通知</title>
</svelte:head>

<PageHeader></PageHeader>
<h1 class="text-text-primary py-3 text-center text-lg font-bold">Open CCW 消息中心</h1>
<div class="flex w-full justify-center gap-8 border-b md:gap-24">
  {#if selectedId >= 0}
    {#each noticeTypes as { type, name, icon }, id}
      <button
        type="button"
        aria-current={noticeTypes[selectedId].type === type ? 'page' : undefined}
        class="relative flex size-18 cursor-pointer flex-col flex-wrap items-center justify-center transition-colors {noticeTypes[
          selectedId
        ].type === type
          ? 'border-b-success text-success border-b'
          : 'border-b border-b-transparent'}"
        onclick={() => {
          selectedId = id;
          refreshNotificationSummary();
          goto(`/notice/${type}`);
        }}
      >
        <img src={icon} alt="" aria-hidden="true" class="relative -top-2 size-8" />
        <span class="text-text-primary absolute bottom-2 shrink-0 text-sm">{name}</span>
        {#if $notificationSummary && counts && counts[id] > 0}
          <div
            class="bg-error absolute top-2 right-2 size-4 rounded-full text-xs text-white"
            aria-hidden="true"
          >
            {counts[id]}
          </div>
          <span class="sr-only">{counts[id]} 条未读</span>
        {/if}
      </button>
    {/each}
  {/if}
</div>

<div class="mx-auto mt-3 flex w-full max-w-3xl justify-end px-4">
  <button
    type="button"
    class="bg-bg-secondary text-text-secondary border-border hover:bg-bg-tertiary inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-50"
    disabled={markingAll ||
      !$notificationSummary?.markAll ||
      ($notificationSummary?.totalUnread ?? 0) <= 0}
    onclick={handleMarkAllRead}
  >
    <svg
      class="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6"></path>
    </svg>
    {markingAll ? '标记中...' : '全标已读'}
  </button>
</div>

{#if $token}
  {@render children()}
{:else}
  <Error error="请登录"></Error>
{/if}

<footer class="text-text-placeholder mx-auto w-full max-w-3xl px-4 pt-4 pb-8 text-center">
  <p class="text-xs leading-relaxed">
    消息中心汇集了你在 CCW
    社区的全部动态通知：内容互动通知汇总作品收到的点赞、收藏与评论；回复通知帮你追踪每一条针对你的讨论；好友分享通知展示好友向你推荐的优质内容；系统消息则包含平台公告、账号安全提醒与审核结果。登录后即可在此统一查看与管理所有通知，不错过社区里的任何重要消息。
  </p>
</footer>
