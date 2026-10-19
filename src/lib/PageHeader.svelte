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
    <p
      class="text-logo font-inter ml-2 flex h-full translate-y-[-3%] items-center overflow-hidden text-2xl font-bold whitespace-nowrap md:ml-3 md:text-3xl"
    >
      Open CCW
    </p>
  </a>
  <!-- 移动端放在左侧，避免遮挡居中的 logo；桌面端并入右侧控制区 -->
  {#snippet githubLink()}
    <a
      href="https://github.com/open-ccw/open-ccw"
      target="_blank"
      rel="noopener noreferrer"
      title="GitHub 仓库"
      class="text-logo/80 hover:text-logo inline-block size-6 transition-colors duration-100"
    >
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="size-full">
        <path
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
        />
      </svg>
    </a>
  {/snippet}

  <div class="absolute top-0 left-0 flex h-full items-center pl-3 md:hidden">
    {@render githubLink()}
  </div>
  <div class="absolute right-0 mr-2 flex flex-row items-center gap-0 md:mr-4 md:gap-4">
    <div class="mr-1 hidden md:mr-0 md:flex">{@render githubLink()}</div>
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
