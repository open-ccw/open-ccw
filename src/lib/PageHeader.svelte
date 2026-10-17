<script lang="ts">
  import Logo from './SiteLogo.svelte';
  import CheckInDialog from '#lib/user/checkin/CheckInDialog.svelte';
  import HamburgerButton from './header/HamburgerButton.svelte';
  import HeaderMenu from './header/HeaderMenu.svelte';
  import { user } from '#lib/user/userStore.ts';
  import { logout } from './auth/tokenStore';
  import { goto } from '$app/navigation';
  import { communityWeb } from '#lib/api.ts';
  import { fade, slide } from 'svelte/transition';
  import { notificationStats } from './notify/notifyStatsStore';
  import DarkModeSwitch from './DarkModeSwitch.svelte';

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
    await goto('/');
  }

  function handleCheckIn() {
    showCheckIn = true;
    menuOpen = false;
  }

  async function updateCheckIn() {
    try {
      const { checkInRecordResps, todayIndex } = await communityWeb.getCheckInRecords();
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
  class="sticky top-0 z-50 flex h-12 w-full shrink-0 items-center justify-center bg-[#11111B]/70 backdrop-blur-[10px] [-webkit-backdrop-filter:blur(10px)] md:h-16 md:justify-start"
>
  <a href="/" class="flex h-full items-center justify-center" title="homepage">
    <div class="ml-2 size-8 shrink-0 md:ml-3 md:size-10"><Logo /></div>
    <h1
      class="text-logo font-inter ml-2 flex h-full translate-y-[-3%] items-center overflow-hidden text-2xl font-bold whitespace-nowrap md:ml-3 md:text-3xl"
    >
      Open CCW
    </h1>
  </a>
  <div class="absolute right-0 mr-2 flex flex-row items-center gap-0 md:mr-4 md:gap-4">
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
    class="fixed inset-0 top-12 z-40 bg-black/20 md:top-16"
    transition:fade={{ duration: 100 }}
    onclick={() => (menuOpen = false)}
  >
    <div
      class="bg-bg-secondary border-border absolute top-0 right-0 w-48 rounded-bl-2xl border py-2 shadow-xl md:w-56"
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
