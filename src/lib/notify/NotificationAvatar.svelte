<script lang="ts">
  import AvatarToProfile from '#lib/user/AvatarToProfile.svelte';
  import type { Notification } from '@ccw-api/api';
  import systemLogo from '#lib/assets/system_logo.svg';

  const { page }: { page: Notification.NotificationPage } = $props();
  const isSystem = $derived(
    [
      'SESSION_CREATED',
      'COMMUNITY_ACTIVITY',
      'POST_VISIBILITY_CHANGED',
      'CREATION_RECOMMENDED_AS_POTENTIAL',
      'CREATION_CHECKED',
    ].includes(page.contentCategory),
  );
</script>

<div class="size-10 shrink-0">
  {#if isSystem}
    <img src={systemLogo} alt="community" />
  {:else}
    <AvatarToProfile
      url={page.senderInfo?.avatar || page.avatar || systemLogo}
      oid={page.senderInfo?.oid || page.senderOid}
    />
  {/if}
</div>
