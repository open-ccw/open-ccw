<script lang="ts">
  import CommentView from '#lib/comment/CommentView.svelte';

  let {
    oid,
    commentCount = 0,
    anchorCommentId,
  }: {
    oid: string;
    commentCount?: number | null;
    anchorCommentId?: number;
  } = $props();
</script>

<section class="border-border mx-auto mt-8 flex max-w-4xl flex-col gap-4 border-t pt-6">
  <h2 class="text-text-primary flex items-center gap-2 text-lg font-semibold">
    评论
    {#if commentCount != null && commentCount > 0}
      <span class="text-text-placeholder text-sm font-normal">{commentCount}</span>
    {/if}
  </h2>
  <CommentView
    {oid}
    subjectType="POST"
    sectionType="COMMENT"
    {anchorCommentId}
  />
</section>
