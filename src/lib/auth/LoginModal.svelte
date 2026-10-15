<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { loginAccount } from "./loginApi";
  import { toast } from "#lib";
  import CancelButton from "#lib/CancelButton.svelte";
  import { fade, scale } from "svelte/transition";
  import AvatarImage from "#lib/user/AvatarImage.svelte";
  import { updateToken, user } from "#lib/user/userStore.ts";
  import { freshTokenFor } from "#lib/oauth/refresh";
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
  } from "./tokenStore";

  let dialog = $state<HTMLDialogElement>();
  let passkey = $state("");
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
      toast.warning("请先选择要登录的账号");
      return;
    }
    const name = selectedAccount.name;
    submitting = true;
    try {
      if (!passkey) {
        // 未填密钥时尝试快捷登录
        const tok = await loadQuickToken(name);
        if (!tok) {
          toast.warning("该账号未启用快捷登录，请输入密钥");
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
        toast.error("密钥错误");
        return;
      }
      // 本地解密失败，尝试云端登录并更新本地数据
      const tok = await loginAccount(name, passkey);
      const currentUser = get(user);
      const avatar = currentUser.loggedIn ? currentUser.avatar : "";
      const displayName = currentUser.loggedIn ? currentUser.name : "";
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
      passkey = "";
      return;
    }
    selectedAccount = account;
    passkey = "";
  }

  function handleRemoveAccount(account: Account) {
    removeAccount(account.name);
    menuAccount = null;
    if (selectedAccount?.name === account.name) {
      selectedAccount = null;
      passkey = "";
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
  class="bg-transparent border-0 p-0"
  onclick={(e) => {
    if (
      menuAccount &&
      !(e.target as HTMLElement).closest("[data-account-card]")
    ) {
      menuAccount = null;
    }
  }}
>
  <div
    class="fixed inset-0 flex items-center justify-center"
    transition:scale={{ duration: 200 }}
  >
    <div
      class="w-108 rounded-xl bg-bg-secondary/70 backdrop-blur-[10px] border border-white/20 p-8 shadow-2xl"
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-text-primary">登录</h2>
        <div class="w-6 h-6">
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
          <p class="py-8 text-center text-sm text-text-secondary">
            本地暂无账号，请先注册
          </p>
        {:else}
          <div class="grid grid-cols-3 gap-3 py-2 max-h-60 overflow-y-auto">
            {#each accounts as account (account.name)}
              <div
                class="relative flex flex-col items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer select-none {selectedAccount?.name ===
                account.name
                  ? 'bg-primary/10 ring-2 ring-primary ring-inset'
                  : 'hover:bg-white/5'}"
                data-account-card
                role="button"
                tabindex="0"
                onclick={() => handleAccountClick(account)}
                onkeydown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAccountClick(account);
                  }
                }}
                oncontextmenu={(e) => {
                  e.preventDefault();
                  menuAccount = account.name;
                }}
              >
                <div class="w-14 h-14">
                  <AvatarImage
                    url={account.avatar || undefined}
                    alt={displayAccountName(account.name)}
                  />
                </div>
                {#if account.displayName}
                  <span
                    class="text-xs font-medium text-text-primary truncate w-full text-center"
                    >{account.displayName}</span
                  >
                {/if}
                <span
                  class="text-xs text-text-secondary truncate w-full text-center {account.displayName
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
                    class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-bg/90 border border-border-strong text-text-secondary shadow-md flex items-center justify-center hover:bg-error hover:text-white hover:border-error transition-colors cursor-pointer z-10"
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
            <label for="password" class="block text-sm text-text-primary mb-2"
              >密钥<span class="text-text-secondary text-xs ml-1"
                >（已启用快捷登录的账号可留空）</span
              ></label
            >
            <input
              id="password"
              type="password"
              bind:value={passkey}
              autocomplete="current-password"
              placeholder="请输入密钥"
              class="p-3 w-full rounded-lg bg-bg border border-border-strong text-text-primary focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <label class="flex items-center gap-2 cursor-pointer select-none">
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
          class="w-full rounded-lg bg-bg border-2 border-primary text-text-primary font-semibold p-3 hover:bg-success/10 active:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {submitting ? "登录中..." : "登录"}
        </button>
      </form>

      <div class="flex items-center justify-center gap-1 mt-5 text-sm">
        <span class="text-text-secondary">还没有账号？</span>
        <a
          href="/register"
          class="text-info underline hover:text-primary transition-colors cursor-pointer"
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
    border: var(--checkbox-border-width) var(--checkbox-border-style)
      var(--checkbox-border-color);
    -webkit-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;
    cursor: pointer;
    position: relative;
  }

  .ui-checkbox::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    -webkit-box-shadow: 0 0 0 calc(var(--checkbox-diameter) / 2.5)
      var(--primary-color);
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
    content: "";
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
    -webkit-transform: translate(-50%, -50%) rotate(45deg)
      scale(var(--checkmark-size));
    -ms-transform: translate(-50%, -50%) rotate(45deg)
      scale(var(--checkmark-size));
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
