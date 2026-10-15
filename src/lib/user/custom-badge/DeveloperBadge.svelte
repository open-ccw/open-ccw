<script lang="ts">
  import { getBadgeFiles, badgeInfo } from "#lib/assets/badge/badgeInfo.ts";

  let { name, size = "h-6" }: { name: string; size?: string } = $props();

  const files = $derived(getBadgeFiles(name));
  const info = $derived(badgeInfo[name] ?? []);
  const lineClassNames = [
    "font-bold text-xs text-text-primary",
    "text-xs text-text-primary",
    "text-xs text-text-secondary",
  ];
  function prevent(e: Event) {
    e.preventDefault();
  }
</script>

<div class="group w-fit flex flex-col items-center relative ml-4 mr-1">
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
    class="w-fit flex transition-opacity group-hover:opacity-100 group-hover:scale-100 scale-0 opacity-0 {size ==
    'h-6'
      ? 'top-8'
      : 'top-9'} bg-bg-secondary p-2 rounded-lg gap-2 z-10 absolute float-left border border-white/10 shadow shadow-gray-500"
  >
    <div
      class="bg-bg-secondary rounded-lg shrink-0 size-16 border border-white/10"
    >
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
    <div class="flex flex-col w-48 gap-1">
      {#each info as text, i}
        <p class={lineClassNames[i]}>{text}</p>
      {/each}
    </div>
  </div>
</div>
