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

  const LOCAL_ORIGIN = 'https://ccw.kivotos.qzz.io';

  const url = $derived(parseUrl(href, commentId));

  function parseUrl(href: string, commentId?: string) {
    let target = href;
    if (target.startsWith('https://www.ccw.site/post/')) {
      target = target.replace('https://www.ccw.site/post/', '/article/');
    }
    if (!commentId) {
      return target;
    }
    let parsed: URL;
    try {
      parsed = new URL(target, LOCAL_ORIGIN);
    } catch {
      return target;
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return target;
    }
    parsed.searchParams.set('comment', commentId);
    if (parsed.origin === LOCAL_ORIGIN) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return parsed.toString();
  }
</script>

<a href={url} {target} class="text-primary flex gap-2 underline">
  <span>
    {@render children()}
  </span>
  {#if commentId}
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="relative bottom-0.5 inline size-4"
    >
      <path
        d="M10 1.667a5.833 5.833 0 0 0-5.833 5.833c0 4.375 5.833 10.833 5.833 10.833s5.833-6.458 5.833-10.833A5.833 5.833 0 0 0 10 1.667Zm0 7.916a2.083 2.083 0 1 1 0-4.166 2.083 2.083 0 0 1 0 4.166Z"
        fill="currentColor"
      ></path>
    </svg>
  {/if}
  {#if url.startsWith('http')}
    ↗
  {/if}
</a>
