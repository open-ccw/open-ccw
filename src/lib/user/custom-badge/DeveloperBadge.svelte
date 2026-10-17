<script lang="ts">
  import { getBadgeFiles, badgeInfo } from '#lib/assets/badge/badgeInfo.ts';

  let { name, size = 'h-6' }: { name: string; size?: string } = $props();

  const files = $derived(getBadgeFiles(name));
  const info = $derived(badgeInfo[name] ?? []);
  const lineClassNames = [
    'font-bold text-xs text-text-primary',
    'text-xs text-text-primary',
    'text-xs text-text-secondary',
  ];
  function prevent(e: Event) {
    e.preventDefault();
  }
</script>

<div class="group relative mr-1 ml-4 flex w-fit flex-col items-center">
  <button type="button" class="cursor-default" oncontextmenu={prevent}>
    <!-- 勋章本体 -->
    <video
      src={files.badge}
      autoplay
      muted
      loop
      playsinline
      disablepictureinpicture
      controlslist="nodownload noplaybackrate noremoteplayback noplay"
      draggable={false}
      class="{size} pointer-events-none scale-120"
      oncontextmenu={prevent}
    ></video>
  </button>
  <div
    class="flex w-fit scale-0 opacity-0 transition-opacity group-hover:scale-100 group-hover:opacity-100 {size ==
    'h-6'
      ? 'top-8'
      : 'top-9'} bg-bg-secondary absolute z-10 float-left gap-2 rounded-lg border border-white/10 p-2 shadow shadow-gray-500"
  >
    <div class="bg-bg-secondary size-16 shrink-0 rounded-lg border border-white/10">
      <video
        src={files.icon}
        autoplay
        muted
        loop
        playsinline
        disablepictureinpicture
        controlslist="nodownload noplaybackrate noremoteplayback noplay"
        draggable={false}
        class="pointer-events-none"
        oncontextmenu={prevent}
      ></video>
    </div>
    <div class="flex w-48 flex-col gap-1">
      {#each info as text, i}
        <p class={lineClassNames[i]}>{text}</p>
      {/each}
    </div>
  </div>
</div>
