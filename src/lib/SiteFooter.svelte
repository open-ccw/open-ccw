<script lang="ts">
  /**
   * 全站页脚：展示域名与部署服务的友情链接（DigitalPlat 免费域名 / Cloudflare）
   */
  const DIGITALPLAT_URL = 'https://dashboard.digitalplat.org/signup?ref=b7rmffqzpy';
  const CLOUDFLARE_URL = 'https://www.cloudflare.com/';
</script>

<footer class="text-text-placeholder flex w-full flex-col items-center gap-1 py-6 text-xs">
  <div class="flex items-center gap-1">
    <span>域名由</span>
    <a
      href={DIGITALPLAT_URL}
      target="_blank"
      rel="noopener noreferrer"
      class="text-text-secondary hover:text-text-primary transition-colors duration-100 hover:underline"
      >DigitalPlat FreeDomain</a
    >
    <span>提供 · 部署于</span>
    <a
      href={CLOUDFLARE_URL}
      target="_blank"
      rel="noopener noreferrer"
      class="text-text-secondary hover:text-text-primary transition-colors duration-100 hover:underline"
    >Cloudflare Workers</a>
  </div>
  <span>Open CCW — 非官方第三方 CCW 启动器</span>
</footer>
