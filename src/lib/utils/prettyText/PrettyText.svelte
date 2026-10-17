<script lang="ts">
  import { render } from './render';
  import { tokenize } from './tokenizer';

  let { text }: { text: string } = $props();
  let components = $derived(render(tokenize(text)));
</script>

<div class="inline-block w-full truncate overflow-hidden text-wrap wrap-anywhere">
  {#each components as { component: C, args }}
    <C {...args}></C>
  {/each}
</div>
