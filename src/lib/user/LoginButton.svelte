<script lang="ts">
  import LoginModal from '#lib/auth/LoginModal.svelte';
  import { user } from '#lib/user/userStore.ts';

  let openLogin = $state(false);
  let { onclose = () => null } = $props();
</script>

{#if !$user.loggedIn}
  <button
    class="border-primary text-primary h-8 w-auto cursor-pointer rounded-[15px] border-2 pr-6 pl-6 text-xl md:h-12 md:text-2xl"
    onclick={() => {
      openLogin = true;
    }}
  >
    登录
  </button>
  {#if openLogin}
    <LoginModal
      onclose={() => {
        onclose();
        openLogin = false;
      }}
    ></LoginModal>
  {/if}
{/if}
