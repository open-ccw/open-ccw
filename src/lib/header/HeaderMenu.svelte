<script lang="ts">
  import LoginButton from '#lib/user/LoginButton.svelte';
  import AvatarToProfile from '#lib/user/AvatarToProfile.svelte';
  import coinSvg from '#lib/assets/coin.svg';
  import noticeSvg from '#lib/assets/notice.svg';
  import cogSvg from '#lib/assets/cog.svg';
  import { user } from '#lib/user/userStore.ts';
  import SearchIcon from '#lib/search/searchIcon.svelte';

  let {
    checkedIn,
    onclose,
    onCheckIn,
    onlogout,
    notifyCount,
  }: {
    checkedIn: boolean;
    onclose: () => void;
    onCheckIn: () => void;
    onlogout: () => void;
    notifyCount: number;
  } = $props();
</script>

{#if $user.loggedIn}
  <!-- 用户信息 -->
  <div class="border-border border-b px-4 py-3">
    <div class="flex items-center gap-3">
      <div class="size-8 shrink-0 md:size-10">
        <AvatarToProfile url={$user.avatar} oid={$user.oid} card={false} />
      </div>
      <div class="min-w-0">
        <a
          class="text-text-primary hover:text-text-secondary block truncate text-sm font-medium md:text-base"
          href="/user/{$user.oid}"
          onclick={onclose}
        >
          {$user.name || '未命名'}
        </a>
      </div>
    </div>
  </div>

  <button
    class="text-text-primary hover:bg-bg-secondary relative flex w-full cursor-pointer items-center gap-3 px-4 py-3 transition-colors"
    onclick={onCheckIn}
  >
    <img src={coinSvg} alt="签到" class="size-6" />
    {#if !checkedIn}
      <span class="bg-error absolute top-3 left-8 size-2 rounded-full"></span>
    {/if}
    <span class="text-sm font-medium">每日签到</span>
  </button>

  <a
    href="/notice/interaction"
    class="text-text-primary hover:bg-bg-secondary flex items-center gap-3 px-4 py-3 transition-colors"
    onclick={onclose}
  >
    <div class="relative size-6">
      <img src={noticeSvg} alt="消息" class="size-6" />
      {#if notifyCount > 0}
        <div
          class="bg-error absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full text-center text-xs text-white"
        >
          {#if notifyCount < 100}
            <span>{notifyCount}</span>
          {:else}
            <span class="text-[8px]">99+</span>
          {/if}
        </div>
      {/if}
    </div>
    <span class="text-sm font-medium">消息通知</span>
  </a>

  <a
    href="/settings/auth"
    class="text-text-primary hover:bg-bg-secondary flex items-center gap-3 px-4 py-3 transition-colors"
    onclick={onclose}
  >
    <img src={cogSvg} alt="设置" class="size-6" />
    <span class="text-sm font-medium">个人设置</span>
  </a>

  {@render search()}

  <div class="border-border mt-1 border-t pt-2">
    <button
      class="text-error hover:bg-bg-secondary flex w-full cursor-pointer items-center gap-3 px-4 py-3 transition-colors"
      onclick={onlogout}
    >
      <svg
        class="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span class="text-sm font-medium">退出登录</span>
    </button>
  </div>
{:else}
  {@render search()}

  <div class="flex flex-col gap-1 px-2 py-2">
    <LoginButton {onclose}></LoginButton>
  </div>
{/if}

{#snippet search()}
  <a
    href="/search"
    class="text-text-primary hover:bg-bg-secondary flex items-center gap-3 px-4 py-3 transition-colors"
  >
    <div class="size-6"><SearchIcon /></div>
    <span class="text-sm font-medium">搜索</span>
  </a>
{/snippet}
