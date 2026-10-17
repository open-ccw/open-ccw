<script lang="ts">
  import { blur } from 'svelte/transition';
  import Portal from 'svelte-portal';
  const { src, alt } = $props();

  let preview = $state(false);
</script>

<button
  class="flex w-fit cursor-pointer flex-col items-center"
  onclick={() => {
    preview = true;
  }}
  aria-label={alt}
>
  <img {src} {alt} class="h-18 w-24 object-cover" />
</button>

{#if preview}
  <Portal target="body">
    <button
      class="fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center bg-black/50 backdrop-blur-sm"
      onclick={() => {
        preview = false;
      }}
      transition:blur={{ duration: 100 }}
    >
      <img {src} {alt} class="aspect-auto h-64 object-cover" />
    </button>
  </Portal>
{/if}
