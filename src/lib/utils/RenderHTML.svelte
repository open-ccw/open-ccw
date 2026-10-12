<script lang="ts">
  import DOMPurify, { type Config } from "dompurify";
  import { marked } from "marked";
  import { default_putify_config } from "#lib/utils/purifyConfig";

  const {
    text,
    config = default_putify_config,
  }: { text: string; config?: Config } = $props();

  let renderAsHTML = $state(false);
  let previewSafeHTML = $state(false);
  let safeHTML = $derived(
    DOMPurify.sanitize(String(marked.parse(text || "loading...")), config),
  );
  let buttonTip = $derived.by(() => {
    if (previewSafeHTML) {
      return "确定渲染以下内容?";
    }
    if (renderAsHTML) {
      return "关闭html渲染";
    }
    if (!renderAsHTML) {
      return "开启html渲染";
    }
  });
</script>

<div>
  <div class="flex w-full">
    <button
      class="ml-auto mr-0 bg-bg-secondary text-error rounded-md border border-error p-1 hover:bg-error/10 dark:hover:bg-error/20 cursor-pointer"
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
      class="mt-1 leading-relaxed text-wrap whitespace-break-spaces bg-bg text-text-primary rounded-2xl p-4 wrap-anywhere"
      id="marked"
    >
      {@html safeHTML}
    </p>
  {:else if previewSafeHTML}
    <p
      class="text-text-primary mt-1 leading-relaxed text-wrap whitespace-break-spaces wrap-anywhere"
    >
      {safeHTML}
    </p>
  {:else}
    <p
      class="text-text-primary mt-1 leading-relaxed text-wrap whitespace-break-spaces wrap-anywhere"
    >
      {text}
    </p>
  {/if}
</div>

<style>
  #marked :global(a) {
    text-decoration: underline;
    color: lightblue;
  }
</style>
