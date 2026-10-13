<script lang="ts">
  import Logo from "./SiteLogo.svelte";
  import CheckInDialog from "#lib/user/checkin/CheckInDialog.svelte";
  import HamburgerButton from "./header/HamburgerButton.svelte";
  import HeaderMenu from "./header/HeaderMenu.svelte";
  import { user } from "#lib/user/userStore";
  import { logout } from "./auth/tokenStore";
  import { goto } from "$app/navigation";
  import { communityWeb } from "#lib/api";
  import { fade, slide } from "svelte/transition";
  import { notificationStats } from "./notify/notifyStatsStore";
  import DarkModeSwitch from "./DarkModeSwitch.svelte";

  let checkedIn = $state(true);
  let showCheckIn = $state(false);
  let menuOpen = $state(false);
  let notifyCount = $derived.by(() => {
    if (!$notificationStats) {
      return;
    }
    return Object.values($notificationStats).reduce((prev, cur) => prev + cur);
  });

  async function handleLogout() {
    await logout();
    menuOpen = false;
    await goto("/");
  }

  function handleCheckIn() {
    showCheckIn = true;
    menuOpen = false;
  }

  async function updateCheckIn() {
    try {
      const { checkInRecordResps, todayIndex } =
        await communityWeb.getCheckInRecords();
      const today = checkInRecordResps[todayIndex];
      checkedIn = today.isCheckIn;
    } catch (e) {
      return;
    }
  }

  async function update() {
    return Promise.all([updateCheckIn()]);
  }

  $effect(() => {
    if ($user.loggedIn) {
      setTimeout(update, 10);
    }
  });
</script>

<!-- 导航栏 -->
<header
  class="bg-[#11111B]/70 w-full h-12 md:h-16 sticky top-0 flex items-center justify-center md:justify-start shrink-0 z-50 backdrop-blur-[10px] [-webkit-backdrop-filter:blur(10px)]"
>
  <a href="/" class="flex items-center justify-center h-full" title="homepage">
    <div class="size-8 md:size-10 ml-2 md:ml-3 shrink-0"><Logo /></div>
    <h1
      class="ml-2 md:ml-3 overflow-hidden h-full text-2xl md:text-3xl text-logo font-bold font-inter whitespace-nowrap flex items-center translate-y-[-3%]"
    >
      Open CCW
    </h1>
  </a>
  <div
    class="absolute right-0 flex flex-row items-center mr-2 md:mr-4 gap-0 md:gap-4"
  >
    <DarkModeSwitch></DarkModeSwitch>
    <HamburgerButton
      open={menuOpen}
      redDot={!checkedIn || notifyCount > 0 || !$user.loggedIn}
      ontoggle={() => (menuOpen = !menuOpen)}
    ></HamburgerButton>
  </div>
</header>

<!-- 折叠菜单 -->
{#if menuOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 top-12 md:top-16 z-40 bg-black/20"
    transition:fade={{ duration: 100 }}
    onclick={() => (menuOpen = false)}
  >
    <div
      class="absolute top-0 right-0 w-48 md:w-56 bg-bg-secondary rounded-bl-2xl shadow-xl py-2 border border-border"
      onclick={(e: MouseEvent) => e.stopPropagation()}
      transition:slide={{ duration: 100 }}
    >
      <HeaderMenu
        {checkedIn}
        onclose={() => (menuOpen = false)}
        onCheckIn={handleCheckIn}
        onlogout={handleLogout}
        {notifyCount}
      ></HeaderMenu>
    </div>
  </div>
{/if}

{#if showCheckIn}
  <CheckInDialog
    onclose={() => {
      showCheckIn = false;
    }}
    onChecked={() => {
      checkedIn = true;
    }}
  />
{/if}
