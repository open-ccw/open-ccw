<script lang="ts">
  import type { SearchTypes } from './searchTypes';

  let { type = $bindable('all') }: { type: SearchTypes } = $props();
</script>

<div class="flex gap-4">
  {@render but('all', '全部')}
  {@render but('students', '创作者')}
</div>

{#snippet but(t: SearchTypes, n: string)}
  <button
    class="text-text-primary cursor-pointer {type == t
      ? 'border-primary border-b'
      : 'border-none'} text-lg transition-all"
    onclick={() => {
      type = t;
    }}
  >
    {n}
  </button>
{/snippet}
