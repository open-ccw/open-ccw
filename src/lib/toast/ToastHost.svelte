<script lang="ts">
  import { fly } from 'svelte/transition';
  import { backOut, cubicOut } from 'svelte/easing';
  import { flip } from 'svelte/animate';
  import { toastItems, dismissToast } from '../toast';
  import successIcon from '#lib/assets/toast/success.svg?raw';
  import errorIcon from '#lib/assets/toast/error.svg?raw';
  import warningIcon from '#lib/assets/toast/warning.svg?raw';
  import infoIcon from '#lib/assets/toast/info.svg?raw';

  const ICONS: Record<string, string> = {
    success: successIcon,
    error: errorIcon,
    warning: warningIcon,
    info: infoIcon,
  };
</script>

<div
  class="pointer-events-none fixed right-6 bottom-6 z-99999 flex flex-col-reverse items-end gap-3"
>
  {#each $toastItems as item (item.id)}
    <button
      type="button"
      class="border-border bg-bg/80 text-text-primary pointer-events-auto box-border flex w-75 cursor-pointer items-center rounded-xl border px-4 py-3 text-left text-[15px] leading-relaxed font-medium shadow-[0_8px_24px_rgba(0,0,0,0.25),0_2px_6px_rgba(0,0,0,0.12)] backdrop-blur-[5px]"
      onclick={() => dismissToast(item.id)}
      in:fly={{ x: 340, duration: 420, easing: backOut }}
      out:fly={{ x: 340, duration: 300, easing: cubicOut }}
      animate:flip={{ duration: 250 }}
    >
      <div
        class="mr-2.5 flex h-6 w-6 shrink-0 items-center justify-center [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
      >
        {@html ICONS[item.type] ?? successIcon}
      </div>
      <span class="ml-1 min-w-0 flex-1 text-left wrap-break-word">{item.msg}</span>
    </button>
  {/each}
</div>
