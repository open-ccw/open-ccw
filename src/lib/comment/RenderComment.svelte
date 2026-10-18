<script lang="ts">
  import PrettyText from '#lib/utils/prettyText/PrettyText.svelte';

  let {
    comment,
    id,
    replyToId,
    receiverName,
  }: { comment: string; id?: number; replyToId?: number; receiverName?: string } = $props();
</script>

<div class="w-full">
  <PrettyText text={comment}></PrettyText>
</div>
{#if id}
  <div class="text-text-secondary text-xs" id="comment-id-{id || Date.now()}">
    <span class="text-text-link">#{id}</span>
    {#if replyToId}
      <span> to </span>
      <button
        class="text-text-link cursor-pointer underline"
        onclick={() => {
          const anchor = document.getElementById(`comment-id-${replyToId}`);
          if (!anchor) {
            return;
          }
          anchor.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          anchor.animate(
            [
              {
                background: 'none',
              },
              {
                background: 'lightgreen',
              },
              {
                background: 'none',
              },
            ],
            400,
          );
        }}>#{replyToId}</button
      >
      <span>回复 </span>
      <span class="text-primary">{receiverName}</span>
    {/if}
  </div>
{/if}
