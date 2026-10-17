<script lang="ts">
  import { sso } from '#lib/api.ts';
  import type { LocateRes } from '../../../routes/settings/auth/locate/+server';
  import type { Session } from './types';

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

  let detailedLocation: LocateRes['data'] | null = $state(null);
  let loadingDetailedLocation = $state(false);
  let copied = $state(false);
  let logoutProcessing = $state(false);
  let loadLocationError = $state('');
  let loggedOut = $state(false);

  function parseLoginType(extra: string): string {
    try {
      const { loginType } = JSON.parse(extra);
      return String(loginType).substring(3);
    } catch {
      return '未知';
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
      const res: LocateRes = await fetch('/settings/auth/locate', {
        method: 'POST',
        body: JSON.stringify({ ip: session.ip }),
      }).then((res) => res.json());
      detailedLocation = res.data;
      detailedLocation.area ||= '未知地区';
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

<tr class="hover:bg-bg-secondary group border-border-strong min-h-12 border-b transition-colors">
  <td
    class="bg-bg group-hover:bg-bg-secondary border-border-strong sticky left-0 z-10 flex size-12 items-center justify-center border-r"
  >
    {#if session.currentDevice}
      <input type="checkbox" disabled checked={false} class="cursor-not-allowed opacity-70" />
    {:else}
      <input type="checkbox" bind:checked={selected} />
    {/if}
  </td>
  <td class="text-text-secondary z-0 px-4 py-3 text-center font-mono text-xs" title={session.ip}>
    {session.id}
  </td>
  <td class="text-text-primary z-0 px-4 py-3 whitespace-nowrap" title={session.device}>
    {#if session.currentDevice}
      <span class="bg-success mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"></span>
    {/if}
    {session.device || '未知设备'}
  </td>
  <td class="text-text-primary z-0 px-4 py-3 whitespace-nowrap" title={session.browser}>
    {session.browser || '未知浏览器'}
  </td>
  <td class="text-text-secondary z-0 px-4 py-3 whitespace-nowrap">
    {loginTime.toLocaleString()}
  </td>
  <td class="z-0 px-4 py-3 text-center">
    <span
      class="bg-bg-secondary text-text-secondary inline-block rounded-full px-2.5 py-0.5 text-xs"
    >
      {loginType}
    </span>
  </td>
  <td class="relative z-0 w-44 px-4 py-3">
    {#if detailedLocation}
      <button
        class="text-success hover:text-success cursor-pointer text-left text-xs whitespace-nowrap transition-colors hover:underline"
        title="点击复制 IP：{session.ip}"
        onclick={copyIP}
      >
        {detailedLocation.isp}
        {detailedLocation.country}-{detailedLocation.prov}-{detailedLocation.city}-{detailedLocation.area}
      </button>
    {:else}
      <button
        class="text-text-secondary hover:text-text-primary cursor-pointer text-left text-xs whitespace-nowrap transition-colors hover:underline"
        title="点击复制 IP：{session.ip}"
        onclick={copyIP}
      >
        {session.area.country}-{session.area.province}-{session.area.city}
      </button>
    {/if}
    {#if copied}
      <span
        class="absolute -top-4 left-8 z-10 rounded bg-gray-800 px-2 py-0.5 text-xs whitespace-nowrap text-white shadow"
      >
        已复制
      </span>
    {/if}
  </td>
  <td class="z-0 px-4 py-3">
    <div class="flex w-44 items-center justify-center gap-2">
      {#if session.currentDevice}
        <span
          class="bg-success/10 text-success rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap"
        >
          当前设备
        </span>
      {/if}

      {#if !detailedLocation}
        {#if loadingDetailedLocation}
          <span class="text-text-placeholder text-xs whitespace-nowrap">查询中...</span>
        {:else}
          {#if loadLocationError}
            <span class="text-error text-xs whitespace-nowrap">{loadLocationError}</span>
          {/if}
          <button
            onclick={fetchDetailedLocation}
            class="bg-info/10 text-info hover:bg-info/20 cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors"
          >
            精确定位
          </button>
        {/if}
      {:else}
        <span class="text-text-placeholder text-xs">已定位</span>
      {/if}

      {#if loggedOut}
        <span class="text-text-placeholder text-xs whitespace-nowrap">已退出</span>
      {:else if logoutProcessing}
        <span class="text-text-placeholder text-xs whitespace-nowrap">正在退出...</span>
      {:else}
        <button
          class="bg-error/10 text-error hover:bg-error/20 cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors"
          onclick={handleLogout}
        >
          退出
        </button>
      {/if}
    </div>
  </td>
</tr>
