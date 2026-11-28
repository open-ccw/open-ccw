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
    <div class="flex items-baseline justify-between gap-2">
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
      <span class="text-text-placeholder text-xs whitespace-nowrap" title={time.toLocaleString()}>
        {time.toLocaleString()}
      </span>
    </div>

    <div class="text-text-secondary mt-1 w-full text-sm leading-relaxed wrap-anywhere">
      <NotificationContentProvider {page}></NotificationContentProvider>
    </div>
  </div>
</div>
