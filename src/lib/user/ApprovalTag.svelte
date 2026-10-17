<script lang="ts">
  import DOMPurify from 'dompurify';
  import type { ApprovalTagType } from './approvalType';

  let {
    tag,
    onClick,
    size = 'h-6',
  }: {
    tag: ApprovalTagType;
    onClick: ((tag: ApprovalTagType) => any) | null;
    size?: string;
  } = $props();
</script>

<div class="group relative mr-1 ml-1 flex w-fit flex-col items-center">
  <button
    onclick={() => {
      if (onClick) {
        onClick(tag);
      }
    }}
    class={onClick != null ? 'cursor-pointer' : ''}
  >
    {#if tag.adorned}
      <img src={tag.approvalIconLink} alt={tag.approvalTagName} class={size} />
    {:else}
      <img
        src={tag.approvalTag.mediumImage}
        alt={tag.approvalTagName}
        class="{size} fliter opacity-50 blur-[1px] group-hover:opacity-100 group-hover:blur-none"
      />
    {/if}
  </button>
  <div
    class="flex w-fit scale-0 opacity-0 transition-opacity group-hover:scale-100 group-hover:opacity-100 {size ==
    'h-6'
      ? 'top-6'
      : 'top-7'} bg-bg-secondary absolute z-20 float-left gap-2 rounded-lg border border-white/10 p-2 shadow shadow-gray-500/50"
  >
    <!-- 雷霆大icon -->
    <div class="bg-bg-secondary size-16 shrink-0 rounded-lg border border-white/10">
      <img src={tag.approvalTag.mediumImage} alt="medium" />
    </div>
    <!-- 雷霆介绍 -->
    <div class="flex w-48 flex-col gap-1">
      <p class="text-text-primary text-xs font-bold">{tag.approvalTagName}</p>
      <p class="text-text-primary text-xs">
        {@html DOMPurify.sanitize(tag.approvalTag.description)}
      </p>
      <p class="text-text-secondary text-xs">{tag.approvalTag.prerequisite}</p>
    </div>
  </div>
</div>
