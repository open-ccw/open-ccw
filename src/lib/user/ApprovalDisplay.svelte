<script lang="ts">
  import { communityWeb } from "#lib/api";
  import { onMount } from "svelte";
  import ApprovalTag from "./ApprovalTag.svelte";
  import type { ApprovalTagType } from "./approvalType";
  import { user } from "#lib/user/userStore";
  import { scale } from "svelte/transition";
  import DeveloperBadge from "./custom-badge/DeveloperBadge.svelte";
  import { developerBadges } from "./custom-badge/developerBadges";

  let {
    oid = "",
    uid = "",
    approvals = null,
    showHidden = true,
    enlarge = false,
  }: {
    oid?: string;
    uid?: string;
    approvals?: ApprovalTagType[] | null;
    showHidden?: boolean;
    enlarge?: boolean;
  } = $props();

  const badgeSize = $derived(enlarge ? "h-7" : "h-5");

  const developerBadgeNames = $derived(
    developerBadges.find((d) => d.oid === oid || d.uid === uid)?.badges ?? [],
  );

  let loading = $state(false);
  let error = $state("");

  function clearErrorLater() {
    setTimeout(() => {
      error = "";
    }, 2000);
  }

  async function adorn(tag: ApprovalTagType) {
    try {
      if (!(await communityWeb.updateApproval(tag.id, true))) {
        throw "设置勋章失败";
      }
      refresh();
    } catch (e) {
      error = String(e);
      clearErrorLater();
    }
  }

  async function detach(tag: ApprovalTagType) {
    try {
      if (!(await communityWeb.updateApproval(tag.id, false))) {
        throw "设置勋章失败";
      }
      refresh();
    } catch (e) {
      error = String(e);
      clearErrorLater();
    }
  }

  const isSelf = $derived($user.loggedIn && $user.oid == oid);

  async function refresh() {
    loading = true;
    try {
      approvals = await communityWeb.getApprovalTags(oid);
    } catch (e) {
      error = String(e);
    }
    loading = false;
  }
  onMount(() => {
    if (approvals) {
      return;
    }
    refresh();
  });
  let adorned = $derived((approvals || []).filter((tag) => tag.adorned));
  let notAdorned = $derived((approvals || []).filter((tag) => !tag.adorned));
</script>

<div class="flex-wrap flex gap-1 relative {enlarge ? '-mt-1' : ''}">
  {#if loading}
    <div
      class="animate-spin border-4 border-t-info border-gray-600 rounded-full size-6"
    ></div>
  {:else}
    {#each adorned as tag}
      <div>
        <ApprovalTag
          {tag}
          size={badgeSize}
          onClick={isSelf && showHidden ? detach : null}
        ></ApprovalTag>
      </div>
    {/each}
    {#if showHidden}
      {#if adorned.length > 0 && notAdorned.length > 0}
        <div class="border-dashed border border-gray-500 {badgeSize}"></div>
      {/if}
      {#each notAdorned as tag}
        <div>
          <ApprovalTag
            {tag}
            size={badgeSize}
            onClick={isSelf && showHidden ? adorn : null}
          ></ApprovalTag>
        </div>
      {/each}
    {/if}
    <!-- Open CCW 社区专属勋章 -->
    {#if developerBadgeNames.length > 0}
      <div class="w-fit flex -ml-1 gap-3">
        {#each developerBadgeNames as name}
          <DeveloperBadge {name} size={badgeSize}></DeveloperBadge>
        {/each}
      </div>
    {/if}
  {/if}
  {#if error}
    <span
      class="text-error border border-error rounded-xl p-2 h-fit absolute top-8 bg-bg-secondary"
      transition:scale>{error}</span
    >
  {/if}
</div>
