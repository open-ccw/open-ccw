<script lang="ts">
  import { slide } from 'svelte/transition';
  import CommentView from './CommentView.svelte';
  import type { TopicConfig } from './types';
  import { backOut } from 'svelte/easing';

  const { oid, subjectType, sectionType }: TopicConfig = $props();
</script>

<div
  class="bg-bg-secondary z-20 h-full w-80 overflow-y-auto shadow-lg shadow-black md:w-lg"
  transition:slide={{ axis: 'x', duration: 250, easing: backOut }}
>
  <CommentView {oid} {subjectType} {sectionType} />
</div>
