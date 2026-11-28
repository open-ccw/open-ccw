<script lang="ts">
  import AvatarToProfile from '#lib/user/AvatarToProfile.svelte';
  import type { NotificationV3Item } from './types.ts';

  /** 由系统发出、不展示用户头像的通知类型 */
  const SYSTEM_CATEGORIES = new Set([
    'SESSION_CREATED',
    'COMMUNITY_ACTIVITY',
    'POST_VISIBILITY_CHANGED',
    'CREATION_RECOMMENDED_AS_POTENTIAL',
    'CREATION_CHECKED',
    'CREATION_BANNED',
    'CREATION_AUDIT_PASSED',
    'POST_RATED_AS_EXCELLENT',
    'COMMENT_DELETED',
    'REPORT_LOG_REJECTED',
  ]);

  const { page }: { page: NotificationV3Item } = $props();

  const senderOid = $derived(page.senderInfo?.oid || page.senderOid || '');

  // 没有具体发送者的一律按系统通知处理，避免把接口返回的彩色图标渲染到列表里
  const isSystem = $derived(!senderOid || SYSTEM_CATEGORIES.has(page.contentCategory));
</script>

<div class="size-10 shrink-0">
  {#if isSystem}
    <span
      class="bg-bg-secondary text-text-secondary flex size-full items-center justify-center rounded-full"
      title="系统通知"
      aria-label="系统通知"
    >
      <svg
        class="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H3v6h3l5 4V5Z"></path>
        <path d="M15.5 8.5a5 5 0 0 1 0 7"></path>
        <path d="M18.5 5.5a9 9 0 0 1 0 13"></path>
      </svg>
    </span>
  {:else}
    <AvatarToProfile url={page.senderInfo?.avatar || page.avatar || null} oid={senderOid} />
  {/if}
</div>
