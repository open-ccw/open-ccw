<script lang="ts">
  import PageHeader from '#lib/PageHeader.svelte';
  import { page } from '$app/state';
  const { children } = $props();

  /** 设置页子导航项 */
  const NAV_ITEMS = [
    { href: '/settings/profile', label: '个人设置' },
    { href: '/settings/auth', label: '登录设备管理' },
  ] as const;
</script>

<PageHeader></PageHeader>
<nav class="border-border bg-bg-secondary/50 flex items-center justify-center gap-2 border-b py-2">
  {#each NAV_ITEMS as item (item.href)}
    <a
      href={item.href}
      class="rounded-lg px-4 py-1.5 text-sm transition-colors duration-100 {page.url.pathname.startsWith(
        item.href,
      )
        ? 'bg-primary text-bg font-semibold'
        : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'}"
    >
      {item.label}
    </a>
  {/each}
</nav>
{@render children()}
