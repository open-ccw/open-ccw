<script lang="ts">
  import AvatarToProfile from '#lib/user/AvatarToProfile.svelte';
  import type { SearchResult } from '@ccw-api/api';
  import { formatCount } from './format';

  let { item }: { item: SearchResult.SearchStudent } = $props();
</script>

<div class="h-16">
  <a
    href="/user/{item.oid}"
    class="bg-bg-secondary border-border flex h-full items-center gap-4 rounded-xl border p-2 shadow transition-all hover:border-indigo-400 hover:shadow-md"
  >
    {#if item.avatar}
      <div class="m-2 size-12">
        <AvatarToProfile url={item.avatar} oid={item.oid} virtual={item.virtualValue}
        ></AvatarToProfile>
      </div>
    {/if}
    <div class="min-w-0 flex-1">
      <div class="text-text-primary truncate font-medium">
        {item.name.replaceAll('<em>', '').replaceAll('</em>', '')}
      </div>
      {#if item.bio}
        <div class="text-text-secondary truncate text-sm">{item.bio}</div>
      {/if}
    </div>
    <div class="text-text-placeholder flex shrink-0 gap-4 text-xs">
      <span>作品 {formatCount(item.creationCount)}</span>
      <span>粉丝 {formatCount(item.followerCount)}</span>
    </div>
  </a>
</div>
