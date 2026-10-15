<script lang="ts">
  import { user } from "#lib/user/userStore.ts";
  import Error from "#lib/utils/Error.svelte";
  import ChangeAvatar from "./ChangeAvatar.svelte";
</script>

{#if $user.loggedIn}
  <ChangeAvatar />
{:else}
  <Error error="请登录"></Error>
{/if}
