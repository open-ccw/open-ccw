<script lang="ts">
  let {
    open,
    redDot,
    ontoggle,
  }: {
    open: boolean;
    redDot: boolean;
    ontoggle: () => void;
  } = $props();
</script>

<button
  class="right-4 z-50 flex size-10 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg transition-colors hover:bg-white/10 md:size-12"
  title="菜单"
  onclick={ontoggle}
  aria-label="菜单"
  aria-expanded={open}
>
  <span
    class="bg-logo block h-0.5 w-5 rounded transition-transform md:w-6 {open
      ? 'translate-y-2 rotate-45'
      : ''}"
  ></span>
  <span class="transition-bg block h-0.5 w-5 rounded md:w-6 {open ? 'bg-transparent' : 'bg-logo'}"
  ></span>
  <span
    class="bg-logo block h-0.5 w-5 rounded transition-transform md:w-6 {open
      ? '-translate-y-2 -rotate-45'
      : ''}"
  ></span>
  {#if redDot}
    <span class="bg-error absolute top-1 right-1 size-2 rounded-full md:size-3"></span>
  {/if}
</button>
