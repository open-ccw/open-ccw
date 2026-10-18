<script lang="ts">
  import { slide } from 'svelte/transition';
  import CommentView from './CommentView.svelte';
  import type { TopicConfig } from './types';
  import { backOut } from 'svelte/easing';

  const { oid, subjectType, sectionType }: TopicConfig = $props();

  /** 面板高度（px），null 表示自适应内容 */
  let panelHeight = $state<number | null>(null);
  let panel: HTMLElement | undefined = $state();
  let dragging = $state(false);

  const MIN_HEIGHT = 240;
  const MAX_VIEWPORT_RATIO = 0.9;

  /** 开始拖动，接管指针事件以便移出面板范围也能继续拖 */
  function onHandleDown(e: PointerEvent) {
    e.preventDefault();
    dragging = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  /** 按指针位置计算面板高度，向上拖增高、向下拖减高 */
  function onHandleMove(e: PointerEvent) {
    if (!dragging || !panel) {
      return;
    }
    const rect = panel.getBoundingClientRect();
    const max = window.innerHeight * MAX_VIEWPORT_RATIO;
    panelHeight = Math.min(max, Math.max(MIN_HEIGHT, rect.bottom - e.clientY));
  }

  function onHandleUp() {
    dragging = false;
  }
</script>

<div class="relative w-full" transition:slide={{ axis: 'y', duration: 250, easing: backOut }}>
  <!-- 顶部拖动条，拖动调整面板高度 -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="absolute -top-1 left-0 z-10 flex h-3 w-full cursor-ns-resize touch-none items-center justify-center"
    onpointerdown={onHandleDown}
    onpointermove={onHandleMove}
    onpointerup={onHandleUp}
    onpointercancel={onHandleUp}
  >
    <div
      class="bg-border h-1 w-12 rounded-full transition-colors duration-100 {dragging
        ? 'bg-primary'
        : 'hover:bg-primary'}"
    ></div>
  </div>
  <div
    bind:this={panel}
    class="bg-bg-secondary border-border w-full overflow-y-auto rounded-t-lg rounded-bl-lg border border-b-0 shadow-md"
    style:height={panelHeight ? `${panelHeight}px` : 'auto'}
    style:max-height={panelHeight ? '90vh' : '70vh'}
  >
    <CommentView {oid} {subjectType} {sectionType} />
  </div>
</div>
