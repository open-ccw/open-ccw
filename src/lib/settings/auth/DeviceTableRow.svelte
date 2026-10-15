<script lang="ts">
  import { sso } from "#lib/api.ts";
  import type { LocateRes } from "../../../routes/settings/auth/locate/+server";
  import type { Session } from "./types";

  let {
    session,
    onLogout,
    selected = $bindable(false),
  }: {
    session: Session;
    onLogout: () => void;
    selected: boolean | undefined;
  } = $props();

  const loginTime = $derived(new Date(session.createdAt));
  const loginType = $derived(parseLoginType(session.extra));

  let detailedLocation: LocateRes["data"] | null = $state(null);
  let loadingDetailedLocation = $state(false);
  let copied = $state(false);
  let logoutProcessing = $state(false);
  let loadLocationError = $state("");
  let loggedOut = $state(false);

  function parseLoginType(extra: string): string {
    try {
      const { loginType } = JSON.parse(extra);
      return String(loginType).substring(3);
    } catch {
      return "未知";
    }
  }

  async function copyIP() {
    await navigator.clipboard.writeText(session.ip);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }

  async function fetchDetailedLocation() {
    loadingDetailedLocation = true;
    try {
      const res: LocateRes = await fetch("/settings/auth/locate", {
        method: "POST",
        body: JSON.stringify({ ip: session.ip }),
      }).then((res) => res.json());
      detailedLocation = res.data;
      detailedLocation.area ||= "未知地区";
    } catch (e) {
      loadLocationError = String(e);
    }
    loadingDetailedLocation = false;
  }

  async function handleLogout() {
    logoutProcessing = true;
    if (await sso.logoutBySession(session.id)) {
      loggedOut = true;
      onLogout();
    }
    logoutProcessing = false;
  }
</script>

<tr
  class="hover:bg-bg-secondary group transition-colors border-b border-border-strong min-h-12"
>
  <td
    class="bg-bg group-hover:bg-bg-secondary size-12 flex justify-center items-center sticky left-0 border-r border-border-strong z-10"
  >
    {#if session.currentDevice}
      <input
        type="checkbox"
        disabled
        checked={false}
        class="opacity-70 cursor-not-allowed"
      />
    {:else}
      <input type="checkbox" bind:checked={selected} />
    {/if}
  </td>
  <td
    class="px-4 py-3 text-center text-text-secondary font-mono text-xs z-0"
    title={session.ip}
  >
    {session.id}
  </td>
  <td
    class="px-4 py-3 whitespace-nowrap z-0 text-text-primary"
    title={session.device}
  >
    {#if session.currentDevice}
      <span
        class="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-success align-middle"
      ></span>
    {/if}
    {session.device || "未知设备"}
  </td>
  <td
    class="px-4 py-3 whitespace-nowrap z-0 text-text-primary"
    title={session.browser}
  >
    {session.browser || "未知浏览器"}
  </td>
  <td class="px-4 py-3 text-text-secondary whitespace-nowrap z-0">
    {loginTime.toLocaleString()}
  </td>
  <td class="px-4 py-3 text-center z-0">
    <span
      class="inline-block rounded-full bg-bg-secondary px-2.5 py-0.5 text-xs text-text-secondary"
    >
      {loginType}
    </span>
  </td>
  <td class="px-4 py-3 relative w-44 z-0">
    {#if detailedLocation}
      <button
        class="text-success text-xs cursor-pointer hover:text-success hover:underline transition-colors text-left whitespace-nowrap"
        title="点击复制 IP：{session.ip}"
        onclick={copyIP}
      >
        {detailedLocation.isp}
        {detailedLocation.country}-{detailedLocation.prov}-{detailedLocation.city}-{detailedLocation.area}
      </button>
    {:else}
      <button
        class="text-text-secondary text-xs cursor-pointer hover:text-text-primary hover:underline transition-colors text-left whitespace-nowrap"
        title="点击复制 IP：{session.ip}"
        onclick={copyIP}
      >
        {session.area.country}-{session.area.province}-{session.area.city}
      </button>
    {/if}
    {#if copied}
      <span
        class="absolute -top-4 left-8 rounded bg-gray-800 px-2 py-0.5 text-xs text-white shadow z-10 whitespace-nowrap"
      >
        已复制
      </span>
    {/if}
  </td>
  <td class="px-4 py-3 z-0">
    <div class="flex items-center justify-center gap-2 w-44">
      {#if session.currentDevice}
        <span
          class="rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success whitespace-nowrap"
        >
          当前设备
        </span>
      {/if}

      {#if !detailedLocation}
        {#if loadingDetailedLocation}
          <span class="text-text-placeholder text-xs whitespace-nowrap"
            >查询中...</span
          >
        {:else}
          {#if loadLocationError}
            <span class="text-error text-xs whitespace-nowrap"
              >{loadLocationError}</span
            >
          {/if}
          <button
            onclick={fetchDetailedLocation}
            class="rounded-md bg-info/10 px-2.5 py-1 text-xs font-medium text-info hover:bg-info/20 transition-colors cursor-pointer whitespace-nowrap"
          >
            精确定位
          </button>
        {/if}
      {:else}
        <span class="text-text-placeholder text-xs">已定位</span>
      {/if}

      {#if loggedOut}
        <span class="text-text-placeholder text-xs whitespace-nowrap"
          >已退出</span
        >
      {:else if logoutProcessing}
        <span class="text-text-placeholder text-xs whitespace-nowrap"
          >正在退出...</span
        >
      {:else}
        <button
          class="rounded-md bg-error/10 px-2.5 py-1 text-xs font-medium text-error hover:bg-error/20 transition-colors cursor-pointer whitespace-nowrap"
          onclick={handleLogout}
        >
          退出
        </button>
      {/if}
    </div>
  </td>
</tr>
