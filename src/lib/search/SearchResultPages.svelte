<script lang="ts">
  import { communityWeb } from "#lib/api";
  import Error from "#lib/utils/Error.svelte";
  import { onMount } from "svelte";
  import SearchBar from "#lib/search/SearchBar.svelte";
  import SearchSkeleton from "#lib/search/SearchSkeleton.svelte";
  import SearchEmpty from "#lib/search/SearchEmpty.svelte";
  import SearchAllResultsPage from "#lib/search/SearchAllResultsPage.svelte";
  import type { SearchTypes } from "./searchTypes";
  import SearchTypeSwitch from "./SearchTypeSwitch.svelte";

  let loading = $state(false);
  let results:
    | null
    | Awaited<ReturnType<typeof communityWeb.searchAll>>["results"] =
    $state(null);
  let error = $state("");
  let searched = $state(false);
  let {
    keyword = $bindable(""),
    type = $bindable("all"),
    onSearch,
  }: {
    keyword?: string;
    type?: SearchTypes;
    onSearch(): any;
  } = $props();

  async function refreshSearch() {
    keyword = keyword.trim();
    if (!keyword) {
      results = null;
      searched = false;
      return;
    }
    if (loading) {
      return;
    }
    loading = true;
    error = "";
    try {
      const res = await communityWeb.searchAll(keyword);
      results = res.results;
      searched = true;
    } catch (e) {
      error = String(e);
    }
    loading = false;
  }

  onMount(() => {
    refreshSearch();
  });

  async function handleSearch() {
    await refreshSearch();
    onSearch();
  }
</script>

<div class="max-w-3xl mx-auto p-2">
  <div class="mb-6">
    <SearchBar bind:value={keyword} onsearch={handleSearch}></SearchBar>
  </div>

  <SearchTypeSwitch bind:type></SearchTypeSwitch>
  <Error {error}></Error>
  {#if loading}
    <SearchSkeleton />
  {:else if searched && results && results.length > 0}
    {#if type === "all"}
      <SearchAllResultsPage {results}></SearchAllResultsPage>
    {:else}
      未实现
    {/if}
  {:else if searched}
    <SearchEmpty hint="未找到与「{keyword}」相关的结果" />
  {:else}
    <SearchEmpty hint="输入关键词搜索社区内容" />
  {/if}
</div>
