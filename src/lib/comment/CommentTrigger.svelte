<script lang="ts">
  import CommentMain from './CommentMain.svelte';
  import icon from '#lib/assets/chevron-left.svg?raw';
  import { type TopicConfig } from './types';

  let openComment = $state(false);
  const { oid, subjectType, sectionType }: TopicConfig = $props();
</script>

<div class="pointer-events-none fixed right-4 bottom-0 z-30 flex flex-col items-end">
  {#if openComment}
    <div class="pointer-events-auto w-[calc(100vw-2rem)] max-w-lg">
      <CommentMain {oid} {subjectType} {sectionType}></CommentMain>
    </div>
  {/if}
  <button
    title="comment"
    class="border-border bg-bg-secondary text-text-primary pointer-events-auto flex h-10 w-16 shrink-0 cursor-pointer items-center justify-center border transition-all duration-100 {openComment
      ? 'rounded-none border-t-0'
      : 'rounded-t-lg'}"
    onclick={() => {
      openComment = !openComment;
    }}
  >
    <div
      class="{openComment
        ? '-rotate-90'
        : 'rotate-90'} flex items-center transition-all duration-100"
    >
      {@html icon}
    </div>
  </button>
</div>
