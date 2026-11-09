<script lang="ts">
  import { page } from '$app/state';
  import type { PageProps } from './$types';
  import ArticleView from '#lib/article/ArticleView.svelte';
  import PageHeader from '#lib/PageHeader.svelte';

  let { data }: PageProps = $props();

  const article = $derived(data.article);

  const description = $derived(
    article.excerpt?.trim() ||
      article.content.blocks
        .filter((block) => block.text.trim() && block.type !== 'atomic')
        .map((block) => block.text.trim())
        .join(' ')
        .slice(0, 120) ||
      `${article.title} - 来自 CCW 创作者学院的文章`,
  );

  const canonical = $derived(`https://${page.url.host}/article/${article.slug}`);

  // 结构化数据由 JSON.stringify 生成并转义 <，不存在注入风险，故不走 DOMPurify
  const jsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description,
      image: article.featureImage?.url ? [article.featureImage.url] : undefined,
      datePublished: new Date(article.publishedAt ?? article.createdAt).toISOString(),
      dateModified: new Date(
        article.updatedAt ?? article.publishedAt ?? article.createdAt,
      ).toISOString(),
      author: {
        '@type': 'Person',
        name: article.author.name,
        url: `https://${page.url.host}/user/${article.authorOid ?? article.author.oid}`,
      },
      publisher: { '@type': 'Organization', name: 'Open CCW' },
      mainEntityOfPage: canonical,
      keywords: article.keywords ?? undefined,
    }).replace(/</g, '\\u003c'),
  );
</script>

<svelte:head>
  <title>{article.title} — CCW 创作者学院 — Open CCW</title>
  <meta name="description" content={description} />
  {#if article.keywords}
    <meta name="keywords" content={article.keywords} />
  {/if}
  <meta name="author" content={article.author.name} />
  <link rel="canonical" href={canonical} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={article.title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  {#if article.featureImage?.url}
    <meta property="og:image" content={article.featureImage.url} />
  {/if}
  {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<PageHeader></PageHeader>
<ArticleView {article} />
