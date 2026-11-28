<script lang="ts">
  import { onMount } from 'svelte';
  import { getStoredToken } from '#lib/auth/tokenStore';

  /** 允许回跳的开发/preview 域名后缀，避免把 token 交给任意站点 */
  const ALLOWED_SUFFIXES = ['.oc.schale.qzz.io', '.dev.openccw.dpdns.org', '.lvh.me'];
  const ALLOWED_HOSTS = ['localhost', '127.0.0.1'];

  let status = $state<'checking' | 'waiting' | 'error'>('checking');
  let message = $state('');

  /** 校验回跳地址是否属于允许的开发域名 */
  function isAllowedRedirect(value: string): boolean {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return false;
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return false;
    }
    return (
      ALLOWED_HOSTS.includes(url.hostname) ||
      ALLOWED_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix))
    );
  }

  /**
   * 若当前会话已有 access token 则回跳开发地址。
   * token 放在 URL fragment 中传递，不会发送到服务器也不会出现在 Referer 里。
   * @returns 是否已发起跳转
   */
  function handoff(): boolean {
    const redirectUri = new URL(location.href).searchParams.get('redirect_uri') ?? '';
    if (!isAllowedRedirect(redirectUri)) {
      status = 'error';
      message = 'redirect_uri 缺失或不在允许的开发域名列表内';
      return true;
    }
    const accessToken = getStoredToken();
    if (!accessToken) {
      return false;
    }
    const target = new URL(redirectUri);
    target.hash = new URLSearchParams({ dev_token: accessToken }).toString();
    location.replace(target.toString());
    return true;
  }

  onMount(() => {
    if (handoff()) {
      return;
    }
    status = 'waiting';
    // 用户可能先去别处登录主站，回到本页时自动重试
    const retry = () => {
      if (status === 'waiting') {
        handoff();
      }
    };
    document.addEventListener('visibilitychange', retry);
    window.addEventListener('focus', retry);
    return () => {
      document.removeEventListener('visibilitychange', retry);
      window.removeEventListener('focus', retry);
    };
  });
</script>

<svelte:head>
  <title>开发登录跳转 — Open CCW</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="bg-bg flex min-h-screen w-screen items-center justify-center p-6">
  <div class="bg-bg-secondary w-lg max-w-full rounded-lg p-10 text-center shadow-xl">
    {#if status === 'error'}
      <div class="bg-error/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
        <span class="text-error text-2xl font-bold">!</span>
      </div>
      <h2 class="text-text-primary mb-3 text-2xl font-bold">跳转被拒绝</h2>
      <p class="text-text-secondary mb-6 text-sm break-all">{message}</p>
      <a
        href="/"
        class="bg-bg-tertiary text-text-primary hover:bg-border inline-block rounded-lg px-6 py-3 font-medium transition-colors"
      >
        返回首页
      </a>
    {:else if status === 'checking'}
      <div
        class="border-border border-t-primary mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4"
      ></div>
      <h2 class="text-text-primary mb-3 text-2xl font-bold">正在读取开发环境 Token</h2>
      <p class="text-text-secondary text-sm">即将返回开发环境...</p>
    {:else}
      <h2 class="text-text-primary mb-3 text-2xl font-bold">尚未登录主站</h2>
      <p class="text-text-secondary mb-6 text-sm leading-relaxed">
        本页需要当前浏览器已登录主站，才能把 access token 交给开发环境。<br />
        登录完成后回到本页即可自动跳转。
      </p>
      <a
        href="/oauth"
        class="bg-primary hover:bg-primary-hover inline-block rounded-lg px-6 py-3 font-medium text-white transition-colors"
      >
        前往登录
      </a>
    {/if}
  </div>
</div>
