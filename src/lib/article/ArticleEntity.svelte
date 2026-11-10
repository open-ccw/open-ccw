<script lang="ts">
  import type { ArticleEntity } from './types';
  import { safeHttpUrl } from './url.ts';

  let { entity }: { entity: ArticleEntity } = $props();

  /** 允许嵌入的第三方播放器域名，防止任意 iframe 注入 */
  const EMBED_HOSTS = ['player.bilibili.com'];

  /** 校验并规范化嵌入地址，仅放行白名单域名 */
  function safeEmbedUrl(raw?: string): string | null {
    if (!raw) return null;
    try {
      const url = new URL(raw);
      return EMBED_HOSTS.includes(url.hostname) ? url.toString() : null;
    } catch {
      return null;
    }
  }

  const embedUrl = $derived(safeEmbedUrl(entity.data.url));
  const authorUserId = $derived(entity.data.mention?.userId ?? entity.data.userId);
  const cardUrl = $derived(safeHttpUrl(entity.data.url ?? entity.data.href));
  const cardHost = $derived(cardUrl ? new URL(cardUrl).hostname : '');
  const iconUrl = $derived(safeHttpUrl(entity.data.icon));
</script>

{#if entity.type === 'images' && entity.data.url}
  <figure class="my-2 flex flex-col items-center gap-2">
    <img
      src={entity.data.url}
      alt={entity.data.title || '文章配图'}
      loading="lazy"
      class="bg-bg-secondary w-full rounded-lg"
    />
    {#if entity.data.title}
      <figcaption class="text-text-secondary text-center text-sm">{entity.data.title}</figcaption>
    {/if}
  </figure>
{:else if entity.type === 'videos' && entity.data.url}
  <figure class="my-2 flex flex-col gap-2">
    <video
      src={entity.data.url}
      title={entity.data.title || '文章视频'}
      controls
      preload="metadata"
      class="bg-bg-secondary w-full rounded-lg"
    >
      <track kind="captions" />
    </video>
    {#if entity.data.title}
      <figcaption class="text-text-secondary text-center text-sm">{entity.data.title}</figcaption>
    {/if}
  </figure>
{:else if entity.type === 'embed' && embedUrl}
  <div class="border-border my-2 w-full overflow-hidden rounded-lg border">
    <iframe
      src={embedUrl}
      title={entity.data.title || '嵌入内容'}
      loading="lazy"
      referrerpolicy="no-referrer"
      sandbox="allow-scripts allow-same-origin allow-presentation"
      class="aspect-video w-full"
    ></iframe>
  </div>
{:else if entity.type === 'project' && entity.data.creationId}
  <a
    href={`/detail/${entity.data.creationId}`}
    class="border-border bg-bg-secondary text-text-secondary hover:bg-bg-tertiary flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors duration-100"
  >
    <span class="text-text-primary font-medium">作品卡片</span>
    <span>在 Open CCW 中查看该作品</span>
  </a>
{:else if entity.type === 'link' && cardUrl}
  <a
    href={cardUrl}
    target="_blank"
    rel="noopener noreferrer"
    class="border-border bg-bg-secondary text-text-secondary hover:bg-bg-tertiary flex min-w-0 items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors duration-100"
  >
    {#if iconUrl}
      <img src={iconUrl} alt="" loading="lazy" class="size-4 shrink-0 rounded" />
    {/if}
    <span class="text-text-primary min-w-0 truncate font-medium">
      {entity.data.title || cardHost}
    </span>
    <span class="ml-auto shrink-0 text-xs">{cardHost}</span>
  </a>
{:else if entity.type === 'user' && authorUserId}
  <a
    href={`/user/${authorUserId}`}
    class="border-border bg-bg-secondary text-text-secondary hover:bg-bg-tertiary flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors duration-100"
  >
    <span class="text-text-primary font-medium">用户卡片</span>
    <span>查看该用户主页</span>
  </a>
{/if}
