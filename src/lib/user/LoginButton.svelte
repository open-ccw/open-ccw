<script lang="ts">
  import LoginModal from "#lib/auth/LoginModal.svelte";
  import { user } from "#lib/user/userStore.ts";

  let openLogin = $state(false);
  let { onclose = () => null } = $props();
</script>

{#if !$user.loggedIn}
  <button
    class="border-primary border-2 rounded-[15px] w-auto md:h-12 h-8 pl-6 pr-6 md:text-2xl text-xl text-primary cursor-pointer"
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
