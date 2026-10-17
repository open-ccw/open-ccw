<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { loginAccount } from './loginApi';
  import { toast } from '#lib';
  import CancelButton from '#lib/CancelButton.svelte';
  import { fade, scale } from 'svelte/transition';
  import AvatarImage from '#lib/user/AvatarImage.svelte';
  import { updateToken, user } from '#lib/user/userStore.ts';
  import { freshTokenFor } from '#lib/oauth/refresh';
  import {
    disableQuickLogin,
    displayAccountName,
    enableQuickLogin,
    listAccounts,
    loadAccount,
    loadQuickToken,
    LOCAL_ACCOUNT_SUFFIX,
    removeAccount,
    saveAccount,
    setActiveAccount,
    updateAccountInfo,
    updateAccountToken,
    type Account,
  } from './tokenStore';

  let dialog = $state<HTMLDialogElement>();
  let passkey = $state('');
  let submitting = $state(false);
  let accounts = $state<Account[]>([]);
  let menuAccount = $state<string | null>(null);
  let selectedAccount = $state<Account | null>(null);
  let trustDevice = $state(false);
  type Props = { onclose(): void };

  const { onclose }: Props = $props();

  onMount(() => {
    accounts = listAccounts();
    selectedAccount = null;
    dialog?.showModal();
  });

  /** 登录后更新 token 与账号信息（token 过期时先刷新再拉取用户信息） */
  async function applyLogin(name: string, tok: string) {
    setActiveAccount(name);
    const finalTok = await freshTokenFor(name, tok);
    await updateToken(finalTok);
    const currentUser = get(user);
    if (currentUser.loggedIn) {
      updateAccountInfo(name, {
        avatar: currentUser.avatar,
        displayName: currentUser.name,
      });
    }
  }

  function finish() {
    onclose();
    dialog?.close();
  }

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    if (!selectedAccount) {
      toast.warning('请先选择要登录的账号');
      return;
    }
    const name = selectedAccount.name;
    submitting = true;
    try {
      if (!passkey) {
        // 未填密钥时尝试快捷登录
        const tok = await loadQuickToken(name);
        if (!tok) {
          toast.warning('该账号未启用快捷登录，请输入密钥');
          return;
        }
        await applyLogin(name, tok);
        finish();
        return;
      }
      const localOnly = name.endsWith(LOCAL_ACCOUNT_SUFFIX);
      const localTok = await loadAccount(name, passkey);
      if (localTok) {
        if (trustDevice) {
          await enableQuickLogin(name, localTok);
        } else {
          disableQuickLogin(name);
        }
        await applyLogin(name, localTok);
        finish();
        return;
      }
      if (localOnly) {
        toast.error('密钥错误');
        return;
      }
      // 本地解密失败，尝试云端登录并更新本地数据
      const tok = await loginAccount(name, passkey);
      const currentUser = get(user);
      const avatar = currentUser.loggedIn ? currentUser.avatar : '';
      const displayName = currentUser.loggedIn ? currentUser.name : '';
      if (listAccounts().some((a) => a.name === name)) {
        await updateAccountToken(name, tok, passkey, avatar, displayName);
      } else {
        await saveAccount(name, tok, passkey, avatar, displayName);
      }
      if (trustDevice) {
        await enableQuickLogin(name, tok);
      } else {
        disableQuickLogin(name);
      }
      await applyLogin(name, tok);
      finish();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      submitting = false;
    }
  }

  function handleAccountClick(account: Account) {
    if (menuAccount) {
      menuAccount = null;
    }
    if (selectedAccount?.name === account.name) {
      selectedAccount = null;
      passkey = '';
      return;
    }
    selectedAccount = account;
    passkey = '';
  }

  function handleRemoveAccount(account: Account) {
    removeAccount(account.name);
    menuAccount = null;
    if (selectedAccount?.name === account.name) {
      selectedAccount = null;
      passkey = '';
    }
    accounts = listAccounts();
    toast.success(`已删除账号 ${displayAccountName(account.name)} 的本地数据`);
  }

  function handleClose() {
    onclose();
    dialog?.close();
  }
</script>

<dialog
  bind:this={dialog}
  class="border-0 bg-transparent p-0"
  onclick={(e) => {
    if (menuAccount && !(e.target as HTMLElement).closest('[data-account-card]')) {
      menuAccount = null;
    }
  }}
>
  <div class="fixed inset-0 flex items-center justify-center" transition:scale={{ duration: 200 }}>
    <div
      class="bg-bg-secondary/70 w-108 rounded-xl border border-white/20 p-8 shadow-2xl backdrop-blur-[10px]"
    >
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-text-primary text-2xl font-bold">登录</h2>
        <div class="h-6 w-6">
          <CancelButton
            onclick={() => {
              if (!dialog) {
                return;
              }
              handleClose();
            }}
          ></CancelButton>
        </div>
      </div>

      <form onsubmit={handleLogin} class="space-y-4">
        {#if accounts.length === 0}
          <p class="text-text-secondary py-8 text-center text-sm">本地暂无账号，请先注册</p>
        {:else}
          <div class="grid max-h-60 grid-cols-3 gap-3 overflow-y-auto py-2">
            {#each accounts as account (account.name)}
              <div
                class="relative flex cursor-pointer flex-col items-center gap-2 rounded-lg p-2 transition-colors select-none {selectedAccount?.name ===
                account.name
                  ? 'bg-primary/10 ring-primary ring-2 ring-inset'
                  : 'hover:bg-white/5'}"
                data-account-card
                role="button"
                tabindex="0"
                onclick={() => handleAccountClick(account)}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAccountClick(account);
                  }
                }}
                oncontextmenu={(e) => {
                  e.preventDefault();
                  menuAccount = account.name;
                }}
              >
                <div class="h-14 w-14">
                  <AvatarImage
                    url={account.avatar || undefined}
                    alt={displayAccountName(account.name)}
                  />
                </div>
                {#if account.displayName}
                  <span class="text-text-primary w-full truncate text-center text-xs font-medium"
                    >{account.displayName}</span
                  >
                {/if}
                <span
                  class="text-text-secondary w-full truncate text-center text-xs {account.displayName
                    ? '-mt-1.5'
                    : ''}">{displayAccountName(account.name)}</span
                >
                {#if menuAccount === account.name}
                  <button
                    type="button"
                    onclick={(e) => {
                      e.stopPropagation();
                      handleRemoveAccount(account);
                    }}
                    aria-label={`删除账号 ${displayAccountName(account.name)}`}
                    title="删除账号"
                    in:scale={{ duration: 120, start: 0.7 }}
                    out:fade={{ duration: 120 }}
                    class="bg-bg/90 border-border-strong text-text-secondary hover:bg-error hover:border-error absolute -top-1.5 -right-1.5 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border shadow-md transition-colors hover:text-white"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        {/if}

        {#if selectedAccount}
          <div>
            <label for="password" class="text-text-primary mb-2 block text-sm"
              >密钥<span class="text-text-secondary ml-1 text-xs"
                >（已启用快捷登录的账号可留空）</span
              ></label
            >
            <input
              id="password"
              type="password"
              bind:value={passkey}
              autocomplete="current-password"
              placeholder="请输入密钥"
              class="bg-bg border-border-strong text-text-primary focus:border-primary w-full rounded-lg border p-3 transition-colors focus:outline-none"
            />
          </div>

          <label class="flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={trustDevice}
              onchange={(e) => (trustDevice = e.currentTarget.checked)}
              class="ui-checkbox"
            />
            <span
              class="text-sm leading-relaxed transition-colors {trustDevice
                ? 'text-text-primary'
                : 'text-text-secondary'}"
            >
              信任此设备，启用快捷登录
            </span>
          </label>
        {/if}

        <button
          type="submit"
          disabled={submitting || accounts.length === 0}
          class="bg-bg border-primary text-text-primary hover:bg-success/10 active:bg-primary w-full cursor-pointer rounded-lg border-2 p-3 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? '登录中...' : '登录'}
        </button>
      </form>

      <div class="mt-5 flex items-center justify-center gap-1 text-sm">
        <span class="text-text-secondary">还没有账号？</span>
        <a
          href="/register"
          class="text-info hover:text-primary cursor-pointer underline transition-colors"
          >注册新账号</a
        >
      </div>
    </div>
  </div>
</dialog>

<style>
  .ui-checkbox {
    --primary-color: #1677ff;
    --secondary-color: #fff;
    --primary-hover-color: #4096ff;
    /* checkbox */
    --checkbox-diameter: 16px;
    --checkbox-border-radius: 5px;
    --checkbox-border-color: #d9d9d9;
    --checkbox-border-width: 1px;
    --checkbox-border-style: solid;
    /* checkmark */
    --checkmark-size: 1.2;
  }

  .ui-checkbox {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: var(--checkbox-diameter);
    height: var(--checkbox-diameter);
    border-radius: var(--checkbox-border-radius);
    background: var(--secondary-color);
    border: var(--checkbox-border-width) var(--checkbox-border-style) var(--checkbox-border-color);
    -webkit-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;
    cursor: pointer;
    position: relative;
  }

  .ui-checkbox::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    -webkit-box-shadow: 0 0 0 calc(var(--checkbox-diameter) / 2.5) var(--primary-color);
    box-shadow: 0 0 0 calc(var(--checkbox-diameter) / 2.5) var(--primary-color);
    border-radius: inherit;
    opacity: 0;
    -webkit-transition: all 0.5s cubic-bezier(0.12, 0.4, 0.29, 1.46);
    -o-transition: all 0.5s cubic-bezier(0.12, 0.4, 0.29, 1.46);
    transition: all 0.5s cubic-bezier(0.12, 0.4, 0.29, 1.46);
  }

  .ui-checkbox::before {
    top: 40%;
    left: 50%;
    content: '';
    position: absolute;
    width: 4px;
    height: 7px;
    border-right: 2px solid var(--secondary-color);
    border-bottom: 2px solid var(--secondary-color);
    -webkit-transform: translate(-50%, -50%) rotate(45deg) scale(0);
    -ms-transform: translate(-50%, -50%) rotate(45deg) scale(0);
    transform: translate(-50%, -50%) rotate(45deg) scale(0);
    opacity: 0;
    -webkit-transition:
      all 0.1s cubic-bezier(0.71, -0.46, 0.88, 0.6),
      opacity 0.1s;
    -o-transition:
      all 0.1s cubic-bezier(0.71, -0.46, 0.88, 0.6),
      opacity 0.1s;
    transition:
      all 0.1s cubic-bezier(0.71, -0.46, 0.88, 0.6),
      opacity 0.1s;
  }

  /* actions */
  .ui-checkbox:hover {
    border-color: var(--primary-color);
  }

  .ui-checkbox:checked {
    background: var(--primary-color);
    border-color: transparent;
  }

  .ui-checkbox:checked::before {
    opacity: 1;
    -webkit-transform: translate(-50%, -50%) rotate(45deg) scale(var(--checkmark-size));
    -ms-transform: translate(-50%, -50%) rotate(45deg) scale(var(--checkmark-size));
    transform: translate(-50%, -50%) rotate(45deg) scale(var(--checkmark-size));
    -webkit-transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
    -o-transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
    transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
  }

  .ui-checkbox:active:not(:checked)::after {
    -webkit-transition: none;
    -o-transition: none;
    -webkit-box-shadow: none;
    box-shadow: none;
    transition: none;
    opacity: 1;
  }
</style>
