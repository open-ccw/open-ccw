<script lang="ts">
  import CommentMain from './CommentMain.svelte';
  import icon from '#lib/assets/chevron-left.svg?raw';
  import { type TopicConfig } from './types';

  let openComment = $state(false);
  const { oid, subjectType, sectionType }: TopicConfig = $props();
</script>

<div class="fixed top-0 right-0 z-30 h-full pt-12 md:pt-16">
  <div class="flex h-full flex-row items-center">
    <div
      class="shadow-left shadow-border-strong bg-bg-secondary relative -top-12 z-10 h-18 w-9 rounded-l-full"
    >
      <button
        title="comment"
        class="flex h-full w-full cursor-pointer items-center pl-2"
        onclick={() => {
          openComment = !openComment;
        }}
      >
        <div
          class="{openComment
            ? '-scale-x-100'
            : 'scale-x-100'} text-text-primary flex transform items-center transition-all duration-300"
        >
          {@html icon}
        </div>
      </button>
    </div>
    <div class="relative z-0 h-full">
      {#if openComment}
        <CommentMain {oid} {subjectType} {sectionType}></CommentMain>
      {/if}
    </div>
  </div>
</div>
