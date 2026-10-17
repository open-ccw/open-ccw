<script lang="ts">
  import AvatarImage from '#lib/user/AvatarImage.svelte';
  import { user } from '#lib/user/userStore.ts';
  import { blur } from 'svelte/transition';

  let openModal = $state(false);
  let selectedUrl = $state($user.loggedIn ? $user.avatar : '');
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->

{#if $user.loggedIn}
  <button
    class="group size-24 cursor-pointer overflow-hidden rounded-full"
    onclick={() => {
      openModal = true;
    }}
  >
    <AvatarImage url={$user.avatar}></AvatarImage>
    <div
      class="bg-bg/70 text-text-primary relative top-0 flex size-24 items-center justify-center transition-all group-hover:-top-24"
    >
      修改头像
    </div>
  </button>

  {#if openModal}
    <div
      class="fixed top-0 left-0 z-30 flex h-full w-full items-center justify-center bg-black/50"
      onclick={(e) => {
        if (e.currentTarget !== e.target) {
          return;
        }
        openModal = false;
      }}
      transition:blur={{ duration: 100 }}
      onkeydown={null}
    >
      <div class="bg-bg border-border flex w-64 flex-col rounded-2xl border p-4 pt-2">
        <div class="text-text-primary border-border border-b pb-2 text-xl">修改头像</div>
        <div class="flex w-full justify-center">
          <div class="relative z-0 mt-2 flex w-48 flex-row justify-center">
            <img src={selectedUrl} alt="avatar" class="absolute z-0 size-full" />
            <div class="z-5 size-full bg-black/50">
              <img src={selectedUrl} alt="avatar" class="size-full rounded-full" />
            </div>
          </div>
        </div>
        <div class="text-text-secondary w-full text-center text-sm">预览</div>
        <button
          class="text-bg bg-primary hover:bg-primary-active w-40 cursor-pointer rounded-2xl p-2"
          >上传</button
        >
      </div>
    </div>
  {/if}
{/if}
