<script lang="ts">
  import type { MouseEventHandler } from 'svelte/elements';
  import bg from './assets/cancel.webp';
  type Props = {
    onclick: MouseEventHandler<HTMLButtonElement>;
  };
  const { onclick }: Props = $props();
</script>

<button class="h-full w-full cursor-pointer" title="cancel" {onclick}>
  <img src={bg} class="h-full w-full" alt="x" />
</button>
