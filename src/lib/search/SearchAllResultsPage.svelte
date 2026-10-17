<script lang="ts">
  import type { SearchResult } from '@ccw-api/api';
  import StudentResult from './StudentResult.svelte';
  import PostResult from './PostResult.svelte';
  import CreationResult from './CreationResult.svelte';
  import HashTagResult from './HashTagResult.svelte';
  let {
    results,
  }: {
    results: [
      SearchResult.SearchResultCreation,
      SearchResult.SearchResultStudent,
      SearchResult.SearchResultPost,
      SearchResult.SearchResultHashTag,
    ];
  } = $props();

  const [creation, student, post, hashtag] = $derived(results);
</script>

<div class="mt-4">
  <h2 class="text-text-primary mb-2 text-xl">
    创作者 ({student.pageResult.totalNum})
  </h2>
  {#each student.pageResult.data as item}
    <StudentResult {item}></StudentResult>
  {/each}
</div>
<div class="mt-4">
  <h2 class="text-text-primary mb-2 text-xl">文章 ({post.pageResult.totalNum})</h2>
  {#each post.pageResult.data as item}
    <PostResult {item}></PostResult>
  {/each}
</div>
<div class="mt-4">
  <h2 class="text-text-primary text-xl">作品 ({creation.pageResult.totalNum})</h2>
  <div class="flex flex-row flex-wrap gap-2">
    {#each creation.pageResult.data as item}
      <CreationResult {item}></CreationResult>
    {/each}
  </div>
</div>
<div class="mt-4">
  <h2 class="text-text-primary text-xl">星球 ({hashtag.pageResult.totalNum})</h2>
  {#each hashtag.pageResult.data as item}
    <HashTagResult {item}></HashTagResult>
  {/each}
</div>
