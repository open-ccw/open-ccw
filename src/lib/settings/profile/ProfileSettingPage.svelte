<script lang="ts">
  import { user } from '#lib/user/userStore.ts';
  import Error from '#lib/utils/Error.svelte';
  import ChangeAvatar from './ChangeAvatar.svelte';
</script>

{#if $user.loggedIn}
  <div class="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
    <h1 class="text-text-primary text-center text-lg font-bold">个人设置</h1>

    <div
      class="bg-bg-secondary border-border divide-border flex flex-col divide-y rounded-lg border"
    >
      <!-- 头像 -->
      <div class="flex items-center justify-between gap-4 p-4">
        <div class="flex flex-col gap-0.5">
          <span class="text-text-primary text-sm font-semibold">头像</span>
          <span class="text-text-placeholder text-xs">点击右侧头像更换</span>
        </div>
        <ChangeAvatar />
      </div>

      <!-- 用户名 -->
      <div class="flex items-center justify-between gap-4 p-4">
        <div class="flex min-w-0 flex-col gap-0.5">
          <span class="text-text-primary text-sm font-semibold">用户名</span>
          <span class="text-text-placeholder truncate text-xs">{$user.name}</span>
        </div>
        <button
          class="text-primary border-primary hover:bg-primary hover:text-bg shrink-0 cursor-pointer rounded-lg border px-3 py-1 text-xs transition-colors duration-100"
        >
          修改
        </button>
      </div>

      <!-- 生日 -->
      <div class="flex items-center justify-between gap-4 p-4">
        <div class="flex min-w-0 flex-col gap-0.5">
          <span class="text-text-primary text-sm font-semibold">生日</span>
          <span class="text-text-placeholder truncate text-xs">未设置</span>
        </div>
        <button
          class="border-border text-text-placeholder shrink-0 cursor-not-allowed rounded-lg border px-3 py-1 text-xs"
          disabled
        >
          修改
        </button>
      </div>

      <!-- 性别 -->
      <div class="flex items-center justify-between gap-4 p-4">
        <div class="flex min-w-0 flex-col gap-0.5">
          <span class="text-text-primary text-sm font-semibold">性别</span>
          <span class="text-text-placeholder truncate text-xs">未设置</span>
        </div>
        <button
          class="border-border text-text-placeholder shrink-0 cursor-not-allowed rounded-lg border px-3 py-1 text-xs"
          disabled
        >
          修改
        </button>
      </div>

      <!-- 个性签名 -->
      <div class="flex items-center justify-between gap-4 p-4">
        <div class="flex min-w-0 flex-col gap-0.5">
          <span class="text-text-primary text-sm font-semibold">个性签名</span>
          <span class="text-text-placeholder truncate text-xs">未设置</span>
        </div>
        <button
          class="border-border text-text-placeholder shrink-0 cursor-not-allowed rounded-lg border px-3 py-1 text-xs"
          disabled
        >
          修改
        </button>
      </div>

      <!-- 学过的编程语言 -->
      <div class="flex items-center justify-between gap-4 p-4">
        <div class="flex min-w-0 flex-col gap-0.5">
          <span class="text-text-primary text-sm font-semibold">学过的编程语言</span>
          <span class="text-text-placeholder truncate text-xs">未设置</span>
        </div>
        <button
          class="border-border text-text-placeholder shrink-0 cursor-not-allowed rounded-lg border px-3 py-1 text-xs"
          disabled
        >
          修改
        </button>
      </div>

      <!-- 爱好 -->
      <div class="flex items-center justify-between gap-4 p-4">
        <div class="flex min-w-0 flex-col gap-0.5">
          <span class="text-text-primary text-sm font-semibold">爱好</span>
          <span class="text-text-placeholder truncate text-xs">未设置</span>
        </div>
        <button
          class="border-border text-text-placeholder shrink-0 cursor-not-allowed rounded-lg border px-3 py-1 text-xs"
          disabled
        >
          修改
        </button>
      </div>
    </div>
  </div>
{:else}
  <Error error="请登录"></Error>
{/if}
