<script lang="ts">
  import AvatarToProfile from '#lib/user/AvatarToProfile.svelte';
  import systemIcon from '#lib/assets/system_logo.svg';
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

  // 没有具体发送者的一律按系统通知处理，统一显示系统 Logo 而不是接口返回的图标
  const isSystem = $derived(!senderOid || SYSTEM_CATEGORIES.has(page.contentCategory));
</script>

<div class="size-10 shrink-0">
  {#if isSystem}
    <img src={systemIcon} alt="系统通知" title="系统通知" class="size-full" />
  {:else}
    <AvatarToProfile url={page.senderInfo?.avatar || page.avatar || null} oid={senderOid} />
  {/if}
</div>
