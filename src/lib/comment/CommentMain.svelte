<script lang="ts">
  import { slide } from 'svelte/transition';
  import CommentView from './CommentView.svelte';
  import type { TopicConfig } from './types';
  import { backOut } from 'svelte/easing';

  const { oid, subjectType, sectionType }: TopicConfig = $props();
</script>

<div
  class="bg-bg-secondary border-border max-h-[70vh] w-full overflow-y-auto rounded-t-lg border border-b-0 shadow-md"
  transition:slide={{ axis: 'y', duration: 250, easing: backOut }}
>
  <CommentView {oid} {subjectType} {sectionType} />
</div>
