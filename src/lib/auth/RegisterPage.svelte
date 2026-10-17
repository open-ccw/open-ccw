<script lang="ts">
  import { toast } from '#lib';
  import { getStudentProfile, registerAccount } from '#lib/auth/registerApi';
  import {
    listAccounts,
    localAccountName,
    saveAccount,
    setAccountRefresh,
    updateAccountToken,
  } from '#lib/auth/tokenStore';

  import ccwLogo from '#lib/assets/ccw-logo.webp';
  import bg from '#lib/assets/registerBG.webp';
  import successSvg from '#lib/assets/toast/success.svg';

  let { token = '' } = $props();

  let password = $state('');
  let confirmPassword = $state('');
  let success = $state(false);
  let registeredName = $state('');
  let submitting = $state(false);
  let cloudSave = $state(false);
  let registeredMode = $state<'cloud' | 'local'>('cloud');

  const hasToken = () => token.trim().length > 0;

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    if (!hasToken()) {
      toast.warning('请先通过 CCW 一键授权获取 Token');
      return;
    }
    if (!password) {
      toast.warning('请输入密码');
      return;
    }
    if (!confirmPassword) {
      toast.warning('请再次输入密码确认');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('请输入相同的密码');
      return;
    }

    submitting = true;
    try {
      const t = token.trim();
      const { uid, avatar, name: displayName } = await getStudentProfile(t);
      let savedName: string;
      if (cloudSave) {
        await registerAccount(uid, t, password);
        if (listAccounts().some((a) => a.name === uid)) {
          await updateAccountToken(uid, t, password, avatar, displayName);
        } else {
          await saveAccount(uid, t, password, avatar, displayName);
        }
        registeredMode = 'cloud';
        savedName = uid;
        toast.success('注册成功');
      } else {
        const localName = localAccountName(uid);
        if (listAccounts().some((a) => a.name === localName)) {
          await updateAccountToken(localName, t, password, avatar, displayName);
        } else {
          await saveAccount(localName, t, password, avatar, displayName);
        }
        registeredMode = 'local';
        savedName = localName;
        toast.success('账号已保存到本地');
      }
      persistOAuthRefresh(savedName);
      registeredName = uid;
      success = true;
    } catch (e) {
      toast.error(`注册失败 ${e}`);
    } finally {
      submitting = false;
    }
  }

  /** 将 OAuth 回调暂存的 refresh token 绑定到已保存账号 */
  function persistOAuthRefresh(name: string) {
    const raw = sessionStorage.getItem('oc_oauth_refresh');
    if (!raw) {
      return;
    }
    sessionStorage.removeItem('oc_oauth_refresh');
    try {
      const { refreshToken, expiresAt } = JSON.parse(raw) as {
        refreshToken: string;
        expiresAt: number;
      };
      if (refreshToken && Number.isFinite(expiresAt)) {
        setAccountRefresh(name, refreshToken, expiresAt);
      }
    } catch {}
  }
</script>

<div>
  <div
    class="flex h-screen min-h-fit w-screen items-center justify-center"
    style:background="url({bg}) repeat center/cover"
  >
    <div class="bg-bg/70 h-fit w-lg rounded-2xl p-8 shadow-xl backdrop-blur-[15px]">
      {#if success}
        <div class="py-6 text-center">
          <img src={successSvg} alt="success" class="mx-auto mb-4 h-16 w-16 shrink-0" />
          <h2 class="text-text-primary mb-2 text-2xl font-bold">注册成功</h2>
          <p class="text-text-secondary mb-6">
            {#if registeredMode === 'cloud'}
              账号 "{registeredName}" 注册成功
            {:else}
              账号 "{registeredName}" 已保存到当前设备
            {/if}
          </p>
          <a
            href="/"
            class="bg-primary hover:bg-primary-hover inline-block rounded-lg px-6 py-3 font-semibold text-white transition-colors"
          >
            返回首页登录
          </a>
        </div>
      {:else}
        <h1 class="text-text-primary mr-auto mb-6 ml-auto w-fit text-2xl font-bold">
          欢迎来到Open CCW
        </h1>

        <form onsubmit={handleSubmit} class="space-y-4">
          <div class="border-border flex items-center gap-3 rounded-xl border p-4">
            {#if hasToken()}
              <img src={successSvg} alt="success" class="h-12 w-12 shrink-0" />
              <div class="min-w-0 flex-1">
                <p class="text-text-primary text-sm font-medium">已获取 CCW Token</p>
                <p class="text-text-secondary text-xs break-all">
                  {token.trim()}
                </p>
              </div>
              <a href="/oauth" class="text-info text-xs whitespace-nowrap underline">重新授权</a>
            {:else}
              <a
                href="/oauth"
                class="bg-primary hover:bg-primary-hover active:bg-primary-active flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold text-white transition-colors"
              >
                <img src={ccwLogo} alt="CCW" class="h-6 w-6 rounded-full object-contain" />
                CCW 一键授权
              </a>
            {/if}
          </div>

          {#if hasToken()}
            <div class="mt-2">
              <label for="password" class="text-text-primary mb-2 block text-sm"
                >密码（加密Token）</label
              >
              <input
                id="password"
                type="password"
                bind:value={password}
                autocomplete="new-password"
                placeholder="请设置密码"
                class="border-border text-text-primary focus:border-primary focus:ring-primary w-full rounded-lg border px-4 py-3 transition-colors focus:ring-1 focus:outline-none"
              />
            </div>

            <div class="mt-2">
              <label for="confirm-password" class="text-text-primary mb-2 block text-sm"
                >确认密码</label
              >
              <input
                id="confirm-password"
                type="password"
                bind:value={confirmPassword}
                autocomplete="new-password"
                placeholder="请再次输入密码"
                class="border-border text-text-primary focus:border-primary focus:ring-primary w-full rounded-lg border px-4 py-3 transition-colors focus:ring-1 focus:outline-none"
              />
            </div>

            <label class="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                name="account-storage"
                checked={cloudSave}
                onchange={(e) => (cloudSave = e.currentTarget.checked)}
                class="ui-checkbox"
              />
              <span
                class="text-sm leading-relaxed transition-colors {cloudSave
                  ? 'text-text-primary'
                  : 'text-text-secondary'}"
              >
                云端保存账号，新设备登录无需再注册
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              class="bg-primary hover:bg-primary-hover active:bg-primary-active w-full cursor-pointer rounded-lg py-3 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? '注册中...' : '注册'}
            </button>
          {/if}

          <p class="text-text-secondary text-center text-sm">
            已有账号？
            <a href="/" class="text-info underline">返回登录</a>
          </p>
        </form>
      {/if}
    </div>
  </div>
</div>

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
