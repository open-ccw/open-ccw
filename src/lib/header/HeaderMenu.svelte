<script lang="ts">
  import LoginButton from "#lib/user/LoginButton.svelte";
  import AvatarToProfile from "#lib/user/AvatarToProfile.svelte";
  import coinSvg from "#lib/assets/coin.svg";
  import noticeSvg from "#lib/assets/notice.svg";
  import cogSvg from "#lib/assets/cog.svg";
  import { user } from "#lib/user/userStore";
  import SearchIcon from "#lib/search/searchIcon.svelte";

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
  <div class="px-4 py-3 border-b border-border">
    <div class="flex items-center gap-3">
      <div class="size-8 md:size-10 shrink-0">
        <AvatarToProfile url={$user.avatar} oid={$user.oid} />
      </div>
      <div class="min-w-0">
        <a
          class="text-sm md:text-base font-medium text-text-primary truncate block hover:text-text-secondary"
          href="/user/{$user.oid}"
          onclick={onclose}
        >
          {$user.name || "未命名"}
        </a>
      </div>
    </div>
  </div>

  <button
    class="w-full flex items-center gap-3 px-4 py-3 text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer relative"
    onclick={onCheckIn}
  >
    <img src={coinSvg} alt="签到" class="size-6" />
    {#if !checkedIn}
      <span class="bg-error rounded-full size-2 absolute left-8 top-3"></span>
    {/if}
    <span class="text-sm font-medium">每日签到</span>
  </button>

  <a
    href="/notice/interaction"
    class="flex items-center gap-3 px-4 py-3 text-text-primary hover:bg-bg-secondary transition-colors"
    onclick={onclose}
  >
    <div class="size-6 relative">
      <img src={noticeSvg} alt="消息" class="size-6" />
      {#if notifyCount > 0}
        <div
          class="bg-error rounded-full absolute size-4 -top-2 -right-2 text-center text-white text-xs flex justify-center items-center"
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
    class="flex items-center gap-3 px-4 py-3 text-text-primary hover:bg-bg-secondary transition-colors"
    onclick={onclose}
  >
    <img src={cogSvg} alt="设置" class="size-6" />
    <span class="text-sm font-medium">个人设置</span>
  </a>

  {@render search()}

  <div class="border-t border-border mt-1 pt-2">
    <button
      class="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-bg-secondary transition-colors cursor-pointer"
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
    class="flex items-center gap-3 px-4 py-3 text-text-primary hover:bg-bg-secondary transition-colors"
  >
    <div class="size-6"><SearchIcon /></div>
    <span class="text-sm font-medium">搜索</span>
  </a>
{/snippet}
