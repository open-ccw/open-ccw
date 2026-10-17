<script lang="ts">
  import SearchIcon from './searchIcon.svelte';

  let { hint }: { hint: string } = $props();
</script>

<div class="py-16 text-center">
  <div
    class="bg-bg-secondary mx-auto mb-4 flex size-16 items-center justify-center rounded-full p-4"
  >
    <SearchIcon></SearchIcon>
  </div>
  <p class="text-text-secondary">{hint}</p>
</div>
