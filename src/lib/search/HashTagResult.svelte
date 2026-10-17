<script lang="ts">
  import type { HashTag } from '@ccw-api/api';
  import { formatCount } from './format';

  let { item }: { item: HashTag.HashTag } = $props();

  const name = $derived(item.identifier.replaceAll('<em>', '').replaceAll('</em>', ''));
</script>

<div class="mt-2 h-16">
  <a
    href="https://www.ccw.site/topic/{name}"
    class="bg-bg-secondary border-border flex h-full items-center gap-4 rounded-xl border p-4 shadow transition-all hover:border-indigo-400 hover:shadow-md"
  >
    {#if item.coverLink}
      <img src={item.coverLink} alt={name} class="size-12 shrink-0 rounded-xl object-cover" />
    {/if}
    <div class="min-w-0 flex-1">
      <div class="text-text-primary truncate font-medium">{name}</div>
      <div class="text-text-placeholder truncate text-sm">
        {item.description || '---'}
      </div>
    </div>
    <div class="text-text-placeholder flex shrink-0 gap-4 text-xs">
      <span>成员 {formatCount(item.memberCount)}</span>
      <span>作品 {formatCount(item.creationCount)}</span>
    </div>
  </a>
</div>
