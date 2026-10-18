<script lang="ts">
  import { goto } from '$app/navigation';
  import { communityWeb, sso } from '#lib/api.ts';
  import DeviceTableRow from './DeviceTableRow.svelte';
  import type { Session } from './types';
  import Error from '#lib/utils/Error.svelte';
  import { toast } from '#lib';
  import { user } from '#lib/user/userStore.ts';
  import {
    clearAccountRefresh,
    getAccountRefresh,
    getActiveAccount,
    logout,
  } from '#lib/auth/tokenStore.ts';
  import { revokeOauthToken } from '#lib/oauth/client.ts';

  let sessions = $state<Session[]>([]);
  let loading = $state(true);
  let loggingOutAll = $state(false);
  let loggingOutOauth = $state(false);
  let error = $state('');
  let selected: Record<string, boolean> = $state({});

  const deviceCount = $derived(sessions.length);
  const otherDeviceCount = $derived(sessions.filter((s) => !s.currentDevice).length);
  const selectedSessions = $derived(sessions.filter((s) => selected[s.id] && !s.currentDevice));
  const selectedCount = $derived(selectedSessions.length);
  let hasOauthRefresh = $state(false);

  $effect(() => {
    if ($user.loggedIn) {
      setTimeout(async () => {
        const name = getActiveAccount();
        hasOauthRefresh = Boolean(name && (await getAccountRefresh(name))?.refreshToken);
      }, 10);
    }
  });

  $effect(() => {
    if ($user.loggedIn) {
      setTimeout(refreshSessions, 10);
    }
  });

  async function refreshSessions() {
    selected = {};
    loading = true;
    error = '';
    sessions = [];
    try {
      const totalNum = await communityWeb
        .getStudentSessions({ perPage: 1 })
        .then((res) => res.totalNum);
      sessions = await communityWeb
        .getStudentSessions({ perPage: totalNum, sortField: 'createdAt' })
        .then((res) => res.data);
      sessions.forEach((s) => (selected[s.id] = false));
    } catch (e) {
      error = String(e);
    } finally {
      loading = false;
    }
  }

  async function logoutAll() {
    loggingOutAll = true;
    const others = sessions.filter((s) => !s.currentDevice);
    for (const s of others) {
      await sso.logoutBySession(s.id);
      sessions = sessions.filter((session) => session.id !== s.id);
    }
    await refreshSessions();
    loggingOutAll = false;
  }

  async function logoutSelected() {
    if (selectedCount === 0) return;
    loggingOutAll = true;
    for (const s of selectedSessions) {
      await sso.logoutBySession(s.id);
      sessions = sessions.filter((session) => session.id !== s.id);
    }
    selected = {};
    await refreshSessions();
    loggingOutAll = false;
  }

  /** 撤销当前账号的 OAuth refresh token 并退出登录 */
  async function logoutOauth() {
    const name = getActiveAccount();
    const refreshToken = name ? (await getAccountRefresh(name))?.refreshToken : null;
    if (!refreshToken) {
      toast.warning('当前账号无 OAuth 登录信息');
      return;
    }
    if (!confirm('将撤销当前 OAuth 账号的 refresh token，退出后需重新授权登录。确定继续？')) {
      return;
    }
    loggingOutOauth = true;
    try {
      await revokeOauthToken(refreshToken);
      clearAccountRefresh(name!);
      await logout();
      toast.success('已退出 OAuth 账号');
      goto('/');
    } catch (e) {
      toast.error(String(e));
    } finally {
      loggingOutOauth = false;
    }
  }
</script>

<h1 class="text-text-primary w-full text-center text-lg font-bold">登录设备管理</h1>

{#if error}
  <Error {error}></Error>
{:else}
  <div class="mb-2 flex items-center justify-between px-1">
    <div>
      <p class="text-text-secondary mt-0.5 text-sm">
        {#if loading}
          正在加载设备信息...
        {:else if sessions.length === 0}
          暂无已登录的设备
        {:else}
          当前共 <span class="text-success font-semibold">{deviceCount}</span>
          台设备在线
          {#if otherDeviceCount > 0}
            ，其中 <span class="text-warning font-semibold">{otherDeviceCount}</span> 台为其他设备
          {/if}
        {/if}
      </p>
    </div>
  </div>

  <div class="mb-4 flex flex-wrap items-center justify-end gap-2 px-1">
    {#if hasOauthRefresh}
      {#if loggingOutOauth}
        <span class="bg-bg-secondary text-text-placeholder rounded-lg px-4 py-1 text-sm">
          正在退出 OAuth 账号...
        </span>
      {:else}
        <button
          class="border-error bg-error/10 text-error hover:bg-error/20 hover:border-error cursor-pointer rounded-lg border px-4 py-1 text-sm font-medium whitespace-nowrap transition-colors"
          onclick={logoutOauth}
        >
          退出当前 OAuth 账号
        </button>
      {/if}
    {/if}

    {#if loggingOutAll}
      <span class="bg-bg-secondary text-text-placeholder rounded-lg px-4 py-1 text-sm">
        正在退出 {selectedCount} 台设备...
      </span>
    {:else}
      <button
        class="border-warning bg-warning/10 text-warning hover:bg-warning/20 hover:border-warning cursor-pointer rounded-lg border px-4 py-1 text-sm font-medium whitespace-nowrap transition-colors"
        onclick={logoutSelected}
      >
        退出选中设备 ({selectedCount})
      </button>
    {/if}

    {#if otherDeviceCount > 0}
      {#if loggingOutAll}
        <span class="bg-bg-secondary text-text-placeholder rounded-lg px-4 py-1 text-sm">
          正在退出全部设备...
        </span>
      {:else}
        <button
          class="border-error bg-error/10 text-error hover:bg-error/20 hover:border-error cursor-pointer rounded-lg border px-4 py-1 text-sm whitespace-nowrap transition-colors"
          onclick={logoutAll}
        >
          退出全部设备
        </button>
      {/if}
    {/if}
  </div>

  <div class="w-full p-2">
    <div class="border-border w-full overflow-x-auto rounded-lg border">
      <table class="w-full text-sm">
        <thead>
          <tr
            class="bg-bg-secondary border-border text-text-secondary h-12 border-b text-xs font-semibold tracking-wider uppercase"
          >
            <th
              class="bg-bg-secondary border-border-strong sticky left-0 z-10 flex size-12 items-center justify-center border-r py-3 text-center"
              >选择</th
            >
            <th class="w-fit px-4 py-3 text-center">ID</th>
            <th class="w-min-44 w-fit px-4 py-3 text-left">设备</th>
            <th class="w-min-28 w-fit px-4 py-3 text-left">浏览器</th>
            <th class="w-44 px-4 py-3 text-left">登录时间</th>
            <th class="w-28 px-4 py-3 text-center">登录方式</th>
            <th class="w-min-44 px-4 py-3 text-left">属地</th>
            <th class="w-44 px-4 py-3 text-center">操作</th>
          </tr>
        </thead>
        <tbody class="divide-border bg-bg divide-y">
          {#if loading}
            <tr>
              <td colspan="7" class="px-4 py-16 text-center">
                <div
                  class="border-border border-t-success mx-auto h-8 w-8 animate-spin rounded-full border-2"
                ></div>
                <p class="text-text-placeholder mt-3 text-sm">加载设备列表...</p>
              </td>
            </tr>
          {:else if sessions.length === 0}
            <tr>
              <td colspan="7" class="text-text-placeholder px-4 py-16 text-center">
                暂无设备记录
              </td>
            </tr>
          {:else}
            {#each sessions as session (session.id)}
              <DeviceTableRow
                {session}
                onLogout={refreshSessions}
                bind:selected={selected[session.id]}
              />
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
{/if}
