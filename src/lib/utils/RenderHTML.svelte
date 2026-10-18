<script lang="ts">
  import DOMPurify, { type Config } from 'dompurify';
  import { marked } from 'marked';
  import { default_putify_config } from '#lib/utils/purifyConfig';

  const { text, config = default_putify_config }: { text: string; config?: Config } = $props();

  let renderAsHTML = $state(false);
  let previewSafeHTML = $state(false);
  let safeHTML = $derived(DOMPurify.sanitize(String(marked.parse(text || 'loading...')), config));
  let buttonTip = $derived.by(() => {
    if (previewSafeHTML) {
      return '确定渲染以下内容?';
    }
    if (renderAsHTML) {
      return '关闭html渲染';
    }
    if (!renderAsHTML) {
      return '开启html渲染';
    }
  });
</script>

<div>
  <div class="flex w-full">
    <button
      class="bg-bg-secondary text-error border-error hover:bg-error/10 dark:hover:bg-error/20 mr-0 ml-auto cursor-pointer rounded-md border p-1"
      onclick={() => {
        if (!renderAsHTML && !previewSafeHTML) {
          previewSafeHTML = true;
        } else if (!renderAsHTML && previewSafeHTML) {
          previewSafeHTML = false;
          renderAsHTML = true;
        } else {
          previewSafeHTML = false;
          renderAsHTML = false;
        }
      }}>{buttonTip}</button
    >
  </div>
  {#if renderAsHTML}
    <p
      class="bg-bg text-text-primary mt-1 rounded-2xl p-4 leading-relaxed text-wrap wrap-anywhere whitespace-break-spaces"
      id="marked"
    >
      {@html safeHTML}
    </p>
  {:else if previewSafeHTML}
    <p
      class="text-text-primary mt-1 leading-relaxed text-wrap wrap-anywhere whitespace-break-spaces"
    >
      {safeHTML}
    </p>
  {:else}
    <p
      class="text-text-primary mt-1 leading-relaxed text-wrap wrap-anywhere whitespace-break-spaces"
    >
      {text}
    </p>
  {/if}
</div>

<style>
  :global(.dark) #marked :global(a) {
    text-decoration: underline;
    color: lightblue;
  }

  #marked :global(a) {
    text-decoration: underline;
    color: blue;
  }
</style>
