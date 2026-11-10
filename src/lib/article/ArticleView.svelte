<script lang="ts">
  import type { Article } from './types';
  import { splitBlock, type InlineSegment } from './inline';
  import ArticleEntity from './ArticleEntity.svelte';

  let { article }: { article: Article } = $props();

  const blocks = $derived(
    article.content.blocks.map((block) => splitBlock(block, article.content.entityMap ?? {})),
  );

  /**
   * 格式化文章日期，固定按北京时间输出，避免服务端与浏览器时区不一致导致水合不匹配
   * @param timestamp 毫秒时间戳
   * @returns YYYY-MM-DD
   */
  function formatDate(timestamp?: number): string {
    if (!timestamp) return '';
    return new Date(timestamp + 8 * 3600_000).toISOString().slice(0, 10);
  }

  /** 去掉提及名称里的富文本标签，只保留纯文本 */
  function plainName(name?: string): string {
    return (name ?? '').replace(/<[^>]*>/g, '');
  }
</script>

{#snippet inline(segments: InlineSegment[])}
  {#each segments as segment, index (index)}
    {#if segment.entity?.type === 'mention'}
      <a
        href={`/user/${segment.entity.data.mention?.userId ?? ''}`}
        class="text-primary transition-colors duration-100 hover:underline"
      >
        {segment.text.trim() || plainName(segment.entity.data.mention?.name)}
      </a>
    {:else if segment.href}
      <a
        href={segment.href}
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary transition-colors duration-100 hover:underline"
      >
        {segment.text}
      </a>
    {:else if segment.bold || segment.underline || segment.strike}
      <span
        class={[
          segment.bold && 'font-semibold',
          segment.underline && 'underline',
          segment.strike && 'line-through',
        ]
          .filter(Boolean)
          .join(' ')}>{segment.text}</span
      >
    {:else}
      {segment.text}
    {/if}
  {/each}
{/snippet}

<article class="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
  <header class="flex flex-col gap-4">
    <h1 class="text-text-primary text-3xl leading-snug font-bold">{article.title}</h1>

    <div class="text-text-secondary flex flex-wrap items-center gap-3 text-sm">
      <a
        href={`/user/${article.authorOid ?? article.author.oid}`}
        class="hover:text-text-primary flex items-center gap-2 transition-colors duration-100"
      >
        <img
          src={article.author.avatar}
          alt={article.author.name}
          loading="lazy"
          class="bg-bg-secondary size-8 rounded-full"
        />
        <span>{article.author.name}</span>
      </a>
      <span aria-hidden="true">·</span>
      <time datetime={new Date(article.publishedAt ?? article.createdAt).toISOString()}>
        {formatDate(article.publishedAt ?? article.createdAt)}
      </time>
      {#if article.pageView != null}
        <span aria-hidden="true">·</span>
        <span>{article.pageView} 次阅读</span>
      {/if}
    </div>

    {#if article.tags?.length}
      <div class="flex flex-wrap gap-2">
        {#each article.tags as tag (tag)}
          <span class="bg-bg-secondary text-text-secondary rounded px-2 py-1 text-xs">{tag}</span>
        {/each}
      </div>
    {/if}
  </header>

  {#if article.featureImage?.url}
    <img
      src={article.featureImage.url}
      alt={article.featureImage.alt || article.title}
      class="bg-bg-secondary w-full rounded-lg"
    />
  {/if}

  <div class="text-text-primary flex flex-col gap-4 text-base leading-relaxed">
    {#each blocks as block, index (index)}
      {#if block.type === 'atomic'}
        {#each block.segments as segment, segmentIndex (segmentIndex)}
          {#if segment.entity}
            <ArticleEntity entity={segment.entity} />
          {/if}
        {/each}
      {:else if block.type === 'blockquote'}
        <blockquote class="border-border text-text-secondary border-l-2 pl-4">
          <p>{@render inline(block.segments)}</p>
        </blockquote>
      {:else if block.type === 'header-one' || block.type === 'header-two'}
        <h2 class="text-text-primary mt-2 text-2xl font-bold">
          {@render inline(block.segments)}
        </h2>
      {:else if block.type.startsWith('header-')}
        <h3 class="text-text-primary mt-2 text-xl font-semibold">
          {@render inline(block.segments)}
        </h3>
      {:else if block.type === 'unordered-list-item' || block.type === 'ordered-list-item'}
        <p class="pl-4">• {@render inline(block.segments)}</p>
      {:else if block.segments.some((segment) => segment.text.trim())}
        <p class={block.centered ? 'text-center' : ''}>
          {@render inline(block.segments)}
        </p>
      {/if}
    {/each}
  </div>

  <footer class="border-border text-text-secondary flex flex-col gap-2 border-t pt-4 text-sm">
    <p>本文内容来自 CCW 创作者学院，版权归原作者所有。</p>
    <a
      href={`https://learn.ccw.site/article/${article.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      class="text-primary transition-colors duration-100 hover:underline"
    >
      查看原文
    </a>
  </footer>
</article>
