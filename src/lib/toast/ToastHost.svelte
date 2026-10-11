<script lang="ts">
  import { fly } from "svelte/transition";
  import { backOut, cubicOut } from "svelte/easing";
  import { flip } from "svelte/animate";
  import { toastItems, dismissToast } from "../toast";
  import successIcon from "$lib/assets/toast/success.svg?raw";
  import errorIcon from "$lib/assets/toast/error.svg?raw";
  import warningIcon from "$lib/assets/toast/warning.svg?raw";
  import infoIcon from "$lib/assets/toast/info.svg?raw";

  const ICONS: Record<string, string> = {
    success: successIcon,
    error: errorIcon,
    warning: warningIcon,
    info: infoIcon,
  };
</script>

<div
  class="fixed bottom-6 right-6 z-99999 pointer-events-none flex flex-col-reverse items-end gap-3"
>
  {#each $toastItems as item (item.id)}
    <button
      type="button"
      class="pointer-events-auto cursor-pointer flex items-center w-75 box-border rounded-xl border border-border bg-bg/80 backdrop-blur-[5px] text-text-primary text-left px-4 py-3 text-[15px] font-medium leading-relaxed shadow-[0_8px_24px_rgba(0,0,0,0.25),0_2px_6px_rgba(0,0,0,0.12)]"
      onclick={() => dismissToast(item.id)}
      in:fly={{ x: 340, duration: 420, easing: backOut }}
      out:fly={{ x: 340, duration: 300, easing: cubicOut }}
      animate:flip={{ duration: 250 }}
    >
      <div
        class="flex items-center justify-center w-6 h-6 shrink-0 mr-2.5 [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
      >
        {@html ICONS[item.type] ?? successIcon}
      </div>
      <span class="flex-1 min-w-0 ml-1 text-left wrap-break-word"
        >{item.msg}</span
      >
    </button>
  {/each}
</div>
