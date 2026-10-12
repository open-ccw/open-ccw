<script lang="ts">
  import type { SearchResult } from "@ccw-api/api";
  import { formatCount, formatDate } from "./format";
  import AvatarToProfile from "#lib/user/AvatarToProfile.svelte";
  import { goto } from "$app/navigation";

  let { item }: { item: SearchResult.SearchPost } = $props();
</script>

<div class="h-18 md:h-24">
  <a
    href="https://ccw.site/post/{item.slug}"
    class="h-full flex items-center gap-4 bg-bg-secondary rounded-xl shadow border border-border p-2 hover:border-indigo-400 hover:shadow-md transition-all"
  >
    {#if item.featureImage}
      <img
        src={item.featureImage?.url}
        alt={item.featureImage?.alt}
        class="h-full rounded-lg"
      />
    {/if}
    <div class="min-w-0 flex-1 gap-2 flex flex-col">
      <div class="font-medium text-text-primary truncate">
        {item.title}
      </div>
      <div
        class="flex gap-4 text-xs text-text-placeholder shrink-0 items-center"
      >
        <button
          class="h-8 flex cursor-pointer overflow-hidden items-center"
          onclick={() => goto(`/user/${item.authorOid}`)}
        >
          <div class="shrink-0 size-4 mr-1">
            <AvatarToProfile oid={item.authorOid} url={item.author.avatar} />
          </div>
          {item.author.name}
        </button>
        <div class="flex flex-col md:flex-row w-8 md:w-fit">
          <span>点赞</span><span>{formatCount(item.likeCount)}</span>
        </div>
        <div class="flex flex-col md:flex-row w-8 md:w-fit">
          <span>观看</span><span>{formatCount(item.viewCount)}</span>
        </div>
        <span>{formatDate(item.updatedAt)}</span>
      </div>
    </div>
  </a>
</div>
