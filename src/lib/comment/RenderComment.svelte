<script lang="ts">
  import PrettyText from "#lib/utils/prettyText/PrettyText.svelte";

  let { comment }: { comment: string } = $props();
</script>

<div class="w-full">
  <PrettyText text={comment}></PrettyText>
</div>
