<script lang="ts">
  import AvatarImage from "#lib/user/AvatarImage.svelte";
  import { user } from "#lib/user/userStore";
  import { blur } from "svelte/transition";

  let openModal = $state(false);
  let selectedUrl = $state($user.loggedIn ? $user.avatar : "");
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->

{#if $user.loggedIn}
  <button
    class="size-24 rounded-full cursor-pointer overflow-hidden group"
    onclick={() => {
      openModal = true;
    }}
  >
    <AvatarImage url={$user.avatar}></AvatarImage>
    <div
      class="bg-bg/70 size-24 transition-all relative top-0 group-hover:-top-24 flex items-center justify-center text-text-primary"
    >
      修改头像
    </div>
  </button>

  {#if openModal}
    <div
      class="flex justify-center items-center w-full h-full bg-black/50 fixed top-0 left-0 z-30"
      onclick={(e) => {
        if (e.currentTarget !== e.target) {
          return;
        }
        openModal = false;
      }}
      transition:blur={{ duration: 100 }}
      onkeydown={null}
    >
      <div
        class="flex w-64 bg-bg pt-2 p-4 border border-border rounded-2xl flex-col"
      >
        <div class="text-text-primary text-xl pb-2 border-b border-border">
          修改头像
        </div>
        <div class="w-full justify-center flex">
          <div class="w-48 flex justify-center flex-row relative mt-2 z-0">
            <img
              src={selectedUrl}
              alt="avatar"
              class="size-full absolute z-0"
            />
            <div class="size-full bg-black/50 z-5">
              <img
                src={selectedUrl}
                alt="avatar"
                class="size-full rounded-full"
              />
            </div>
          </div>
        </div>
        <div class="text-center w-full text-sm text-text-secondary">预览</div>
        <button
          class="w-40 text-bg bg-primary hover:bg-primary-active rounded-2xl cursor-pointer p-2"
          >上传</button
        >
      </div>
    </div>
  {/if}
{/if}
