<script lang="ts">
  import PageHeader from "#lib/PageHeader.svelte";
  import type { LayoutProps } from "./$types";
  import { onMount } from "svelte";
  import { noticeTypes } from "./noticeTypes";
  import Error from "#lib/utils/Error.svelte";
  import { goto } from "$app/navigation";
  import { token } from "#lib/auth/tokenStore";
  import {
    notificationStats,
    refreshNotificationStats,
  } from "#lib/notify/notifyStatsStore";

  let { children }: LayoutProps = $props();

  let selectedId: number = $state(-1);
  let error = $state("");
  let counts = $derived.by(() => {
    if (!$notificationStats) {
      return;
    }
    return noticeTypes.map(({ statID }) => {
      return statID.reduce(
        (prev: number, cur) => prev + $notificationStats[cur],
        0,
      );
    });
  });

  onMount(() => {
    try {
      const url = new URL(document.URL);
      const type = url.pathname.split("/")[2];

      if (!type) {
        throw "消息类型错误";
      }
      selectedId = noticeTypes.findIndex((t) => t.type == type);
      if (selectedId < 0) {
        throw "消息类型错误";
      }
    } catch (e) {
      error = String(error);
    }
  });
</script>

<svelte:head>
  <title
    >Open CCW - 消息中心{selectedId >= 0 &&
      ` - ${noticeTypes[selectedId].name}`}</title
  >
</svelte:head>

<PageHeader></PageHeader>
<div class="flex justify-center w-full md:gap-24 gap-8 border-b">
  {#if selectedId >= 0}
    {#each noticeTypes as { type, name, icon }, id}
      <button
        class="relative flex flex-col flex-wrap size-18 justify-center items-center transition-colors cursor-pointer {noticeTypes[
          selectedId
        ].type === type
          ? 'border-b-success border-b text-success'
          : 'border-b border-b-transparent'}"
        onclick={() => {
          selectedId = id;
          refreshNotificationStats();
          goto(`/notice/${type}`);
        }}
      >
        <img src={icon} alt={name} class="size-8 relative -top-2" />
        <span class="absolute text-sm shrink-0 bottom-2 text-text-primary"
          >{name}</span
        >
        {#if $notificationStats && counts && counts[id] > 0}
          <div
            class="bg-error size-4 rounded-full absolute top-2 right-2 text-xs text-white"
          >
            {counts[id]}
          </div>
        {/if}
      </button>
    {/each}
  {/if}
</div>

{#if $token}
  {@render children()}
{:else}
  <Error error="请登录"></Error>
{/if}
