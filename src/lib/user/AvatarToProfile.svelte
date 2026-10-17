<script lang="ts">
  import { tick } from 'svelte';
  import Portal from 'svelte-portal';
  import AvatarImage from './AvatarImage.svelte';
  import UserCard from './card/UserCard.svelte';
  import { fade } from 'svelte/transition';

  let {
    url,
    alt = 'avatar',
    virtual = null,
    oid,
    card = true,
  }: {
    url?: string | null;
    alt?: string;
    virtual?: string | null;
    oid: string;
    card?: boolean;
  } = $props();

  let host: HTMLElement | undefined = $state();
  let cardEl: HTMLElement | undefined = $state();
  let showCard = $state(false);
  let position = $state<{ left: number; top: number } | null>(null);
  let cardWidth = $state(0);
  let cardHeight = $state(0);

  /** 卡片与头像之间的间距（像素） */
  const CARD_GAP = 8;
  /** 卡片与视口边缘的最小留白（像素） */
  const VIEWPORT_MARGIN = 8;
  /** 延迟隐藏的时长（毫秒），留出指针跨越头像与卡片间隙的时间 */
  const HIDE_DELAY = 150;

  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  /**
   * 依据头像与卡片的实际尺寸计算卡片位置
   * 优先在头像上方展开；上方空间不足时翻转到下方；横向超出视口时夹紧到边缘
   */
  function place() {
    if (!host || !cardEl) {
      return;
    }
    const rect = host.getBoundingClientRect();
    const width = cardEl.offsetWidth;
    const height = cardEl.offsetHeight;
    const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN;
    const left = Math.min(
      Math.max(VIEWPORT_MARGIN, rect.left + rect.width / 2 - width / 2),
      Math.max(VIEWPORT_MARGIN, maxLeft),
    );
    const above = rect.top - CARD_GAP - height;
    const below = rect.bottom + CARD_GAP;
    const top =
      above >= VIEWPORT_MARGIN
        ? above
        : Math.min(below, Math.max(VIEWPORT_MARGIN, window.innerHeight - height - VIEWPORT_MARGIN));
    position = { left, top };
  }

  /** 指针进入时展开卡片，先渲染再做位置测量以避免首帧闪烁 */
  async function enter() {
    clearTimeout(hideTimer);
    showCard = true;
    await tick();
    place();
  }

  /**
   * 指针离开时延迟收起
   * 不立即隐藏：否则指针跨越间隙时卡片已开始退场，再次进入会在旧节点退场期间插入新节点而产生闪烁
   */
  function leave() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      showCard = false;
    }, HIDE_DELAY);
  }

  $effect(() => {
    cardWidth;
    cardHeight;
    if (showCard) {
      place();
    }
  });

  $effect(() => {
    if (!showCard) {
      return;
    }
    const onViewportChange = () => place();
    // scroll 用捕获阶段监听，可覆盖内部滚动容器引起的位置变化
    window.addEventListener('scroll', onViewportChange, true);
    window.addEventListener('resize', onViewportChange);
    return () => {
      window.removeEventListener('scroll', onViewportChange, true);
      window.removeEventListener('resize', onViewportChange);
    };
  });
</script>

<div
  class="relative"
  role="presentation"
  bind:this={host}
  onmouseenter={enter}
  onmouseleave={leave}
>
  <a href="/user/{oid}" class="cursor-pointer">
    <AvatarImage url={url ?? undefined} {alt} {virtual}></AvatarImage>
  </a>
</div>

{#if card && showCard}
  <!-- 渲染到 body 并用 fixed 定位，避免被祖先 overflow / transform 裁剪或改变定位基准 -->
  <Portal target="body">
    <div
      class="fixed z-50 {position ? 'visible' : 'invisible'}"
      style:left="{position?.left ?? 0}px"
      style:top="{position?.top ?? 0}px"
      bind:this={cardEl}
      bind:clientWidth={cardWidth}
      bind:clientHeight={cardHeight}
      role="presentation"
      onmouseenter={enter}
      onmouseleave={leave}
      in:fade={{
        duration: 100,
      }}
      out:fade={{
        duration: 100,
      }}
    >
      <UserCard {oid} />
    </div>
  </Portal>
{/if}
