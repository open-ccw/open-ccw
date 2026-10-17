<script lang="ts">
  import type { SearchResult } from '@ccw-api/api';
  import { formatCount, formatDate } from './format';
  import AvatarToProfile from '#lib/user/AvatarToProfile.svelte';
  import { goto } from '$app/navigation';

  let { item }: { item: SearchResult.SearchPost } = $props();
</script>

<div class="h-18 md:h-24">
  <a
    href="https://ccw.site/post/{item.slug}"
    class="bg-bg-secondary border-border flex h-full items-center gap-4 rounded-xl border p-2 shadow transition-all hover:border-indigo-400 hover:shadow-md"
  >
    {#if item.featureImage}
      <img src={item.featureImage?.url} alt={item.featureImage?.alt} class="h-full rounded-lg" />
    {/if}
    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <div class="text-text-primary truncate font-medium">
        {item.title}
      </div>
      <div class="text-text-placeholder flex shrink-0 items-center gap-4 text-xs">
        <button
          class="flex h-8 cursor-pointer items-center overflow-hidden"
          onclick={() => goto(`/user/${item.authorOid}`)}
        >
          <div class="mr-1 size-4 shrink-0">
            <AvatarToProfile oid={item.authorOid} url={item.author.avatar} />
          </div>
          {item.author.name}
        </button>
        <div class="flex w-8 flex-col md:w-fit md:flex-row">
          <span>点赞</span><span>{formatCount(item.likeCount)}</span>
        </div>
        <div class="flex w-8 flex-col md:w-fit md:flex-row">
          <span>观看</span><span>{formatCount(item.viewCount)}</span>
        </div>
        <span>{formatDate(item.updatedAt)}</span>
      </div>
    </div>
  </a>
</div>
