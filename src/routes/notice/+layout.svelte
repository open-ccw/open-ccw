<script lang="ts">
  import PageHeader from '#lib/PageHeader.svelte';
  import type { LayoutProps } from './$types';
  import { onMount } from 'svelte';
  import { noticeTypes } from './noticeTypes';
  import Error from '#lib/utils/Error.svelte';
  import { goto } from '$app/navigation';
  import { token } from '#lib/auth/tokenStore.ts';
  import { notificationStats, refreshNotificationStats } from '#lib/notify/notifyStatsStore.ts';
  import { notificationLoaded } from '#lib/notify/NotificationPage.svelte';

  let { children }: LayoutProps = $props();

  let selectedId: number = $state(-1);
  let error = $state('');
  let counts = $derived.by(() => {
    if (!$notificationStats) {
      return;
    }
    return noticeTypes.map(({ statID }) => {
      return statID.reduce((prev: number, cur) => prev + $notificationStats[cur], 0);
    });
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
<div class="flex w-full justify-center gap-8 border-b md:gap-24">
  {#if selectedId >= 0}
    {#each noticeTypes as { type, name, icon }, id}
      <button
        class="relative flex size-18 cursor-pointer flex-col flex-wrap items-center justify-center transition-colors {noticeTypes[
          selectedId
        ].type === type
          ? 'border-b-success text-success border-b'
          : 'border-b border-b-transparent'}"
        onclick={() => {
          selectedId = id;
          refreshNotificationStats();
          goto(`/notice/${type}`);
        }}
      >
        <img src={icon} alt={name} class="relative -top-2 size-8" />
        <span class="text-text-primary absolute bottom-2 shrink-0 text-sm">{name}</span>
        {#if $notificationStats && counts && counts[id] > 0}
          <div class="bg-error absolute top-2 right-2 size-4 rounded-full text-xs text-white">
            {counts[id]}
          </div>
        {/if}
      </button>
    {/each}
  {/if}
</div>

<section
  class="mx-auto w-full max-w-3xl px-4 pt-3 text-center {$notificationLoaded ? 'hidden' : ''}"
>
  <h1 class="text-text-primary text-base font-bold">Open CCW 消息中心</h1>
  <p class="text-text-placeholder mt-1.5 text-xs leading-relaxed">
    消息中心汇集了你在 CCW
    社区的全部动态通知：内容互动通知汇总作品收到的点赞、收藏与评论；回复通知帮你追踪每一条针对你的讨论；好友分享通知展示好友向你推荐的优质内容；系统消息则包含平台公告、账号安全提醒与审核结果。登录后即可在此统一查看与管理所有通知，不错过社区里的任何重要消息。
  </p>
</section>

{#if $token}
  {@render children()}
{:else}
  <Error error="请登录"></Error>
{/if}
