<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import PageHeader from '#lib/PageHeader.svelte';
  import { parseType } from '#lib/search/parseType.ts';
  import SearchResultPages from '#lib/search/SearchResultPages.svelte';
  import type { SearchTypes } from '#lib/search/searchTypes.ts';
  import { onMount, tick } from 'svelte';

  const { url } = page;

  let search = $state(url.searchParams.get('key') || '');
  let type: SearchTypes = $state(parseType(url.searchParams.get('type') || ''));

  async function refreshSearchParams() {
    const url = new URL(page.url.toString());
    url.searchParams.set('key', search);
    url.searchParams.set('type', type);
    await tick();
    goto(url, { replace: true });
  }
  onMount(() => {
    refreshSearchParams();
  });
</script>

<svelte:head>
  <title>搜索 — Open CCW</title>
  <meta
    name="description"
    content="在 Open CCW 中搜索 CCW 社区的作品、创作者、文章和星球。支持关键词搜索，快速找到你感兴趣的 CCW 内容。"
  />
  <link rel="canonical" href="https://ccw.kivotos.qzz.io/search" />
</svelte:head>

<PageHeader />
<SearchResultPages
  bind:keyword={search}
  bind:type
  onSearch={() => {
    refreshSearchParams();
  }}
/>
