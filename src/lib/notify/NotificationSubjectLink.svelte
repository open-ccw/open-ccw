<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    href,
    commentId,
    target,
    children,
  }: {
    /** 目标链接，可以是相对路径或绝对 URL */
    href: string;
    /** 评论锚点 id，传入后自动追加 comment 查询参数定位到对应评论 */
    commentId?: string;
    /** 链接打开方式，如 _blank */
    target?: string;
    children: Snippet;
  } = $props();

  const url = $derived(commentId ? `${href}?${new URLSearchParams({ comment: commentId })}` : href);
</script>

<a href={url} {target} class="text-primary underline">
  {@render children()}
  {#if commentId}
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="relative bottom-0.5 inline size-4"
      ><path
        d="M10 1.667a5.833 5.833 0 0 0-5.833 5.833c0 4.375 5.833 10.833 5.833 10.833s5.833-6.458 5.833-10.833A5.833 5.833 0 0 0 10 1.667Zm0 7.916a2.083 2.083 0 1 1 0-4.166 2.083 2.083 0 0 1 0 4.166Z"
        fill="currentColor"
      ></path></svg
    >
  {/if}
</a>
