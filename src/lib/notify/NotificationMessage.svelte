<script lang="ts">
  import NotificationAvatar from './NotificationAvatar.svelte';
  import NotificationContentProvider from './NotificationContentProvider.svelte';
  import type { NotificationV3Item } from './types.ts';
  const {
    page,
  }: {
    page: NotificationV3Item;
  } = $props();
  const { createdAt } = $derived(page);
  const time = $derived(new Date(createdAt));
  const unread = $derived(page.readState === 'UNREAD');
  // 新设备登录通知需在标题行提供跳转设备管理的入口
  const sessionId = $derived(
    page.contentCategory === 'SESSION_CREATED' ? page.triggeredById || page.id : '',
  );
</script>

<div
  class="border-border hover:bg-bg-secondary relative flex gap-3 border-b p-4 transition-colors last:border-b-0"
>
  {#if unread}
    <span
      class="bg-error absolute top-2 right-2 size-2 rounded-full"
      title="未读消息"
      aria-label="未读消息"
    ></span>
  {/if}
  <NotificationAvatar {page}></NotificationAvatar>

  <div class="min-w-0 flex-1">
    <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
      {#if page.senderInfo?.oid || page.senderOid}
        {const senderOid = page.senderInfo?.oid || page.senderOid}
        {const senderName = page.senderInfo?.name || page.senderName}
        <a
          href="/user/{senderOid}"
          class="text-text-primary hover:text-info truncate text-sm font-semibold"
        >
          {senderName}
        </a>
      {:else}
        <span class="text-text-primary text-sm font-semibold">系统通知</span>
      {/if}
      <div class="flex shrink-0 items-center gap-2">
        {#if sessionId}
          <a
            href="/settings/auth?session={sessionId}"
            class="text-text-secondary hover:text-text-primary inline-flex items-center gap-0.5 text-xs underline underline-offset-2 transition-colors duration-100"
            title="跳转到设备管理并定位到此登录会话"
          >
            <svg
              class="size-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            管理该设备
          </a>
        {/if}
        <span class="text-text-placeholder text-xs whitespace-nowrap" title={time.toLocaleString()}>
          {time.toLocaleString()}
        </span>
      </div>
    </div>

    <div class="text-text-secondary mt-1 w-full text-sm leading-relaxed wrap-anywhere">
      <NotificationContentProvider {page}></NotificationContentProvider>
    </div>
  </div>
</div>
