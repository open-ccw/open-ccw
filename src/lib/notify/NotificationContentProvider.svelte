<script lang="ts">
  import type {
    NotificationView,
    NotificationView as ASSET_MARKET_DONATE,
    NotificationView as ASSET_MARKET_LIKED,
    NotificationView as ASSET_MARKET_PURCHASED,
    NotificationView as COMMENT_DELETED,
    NotificationView as COMMUNITY_ACTIVITY,
    NotificationView as CREATION_BANNED,
    NotificationView as CREATION_CHECKED,
    NotificationView as CREATION_COMMENTED,
    NotificationView as CREATION_COMMENT_REPLIED,
    NotificationView as CREATION_FAVORITE,
    NotificationView as CREATION_LIKED,
    NotificationView as CREATION_RECOMMENDED_AS_POTENTIAL,
    NotificationView as CREATION_REMIXED,
    NotificationView as CREATION_SHARE,
    NotificationView as EXTENSION_COMMENTED,
    NotificationView as EXTENSION_COMMENT_REPLIED,
    NotificationView as EXTENSION_LIKED,
    NotificationView as FOLLOWED,
    NotificationView as FRIEND_INVITE,
    NotificationView as POST_COMMENT,
    NotificationView as POST_FAVORITE,
    NotificationView as POST_LIKED,
    NotificationView as POST_RATED_AS_EXCELLENT,
    NotificationView as POST_VISIBILITY_CHANGED,
    NotificationView as PROFILE_LEAVE_WORDS,
    NotificationView as REPORT_LOG_REJECTED,
    NotificationView as SESSION_CREATED,
    NotificationView as TEAM_COMMENTED,
    NotificationV3Item,
  } from './types.ts';
  import DOMPurify from 'dompurify';
  import LikeIcon from './LikeIcon.svelte';
  import RenderHTML from '#lib/utils/RenderHTML.svelte';
  import NotificationSubjectLink from './NotificationSubjectLink.svelte';
  import { user } from '#lib/user/userStore.ts';
  import RenderComment from '../comment/RenderComment.svelte';
  import SystemNoticeHtml from './SystemNoticeHtml.svelte';
  import { systemNoticePurifyConfig } from '#lib/utils/purifyConfig.ts';

  const userLinkClass =
    'font-medium text-info underline whitespace-break-spaces text-nowrap shrink-0';

  function legacyString(record: object | null, key: string): string {
    if (!record) {
      return '';
    }
    const value: unknown = (record as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : '';
  }

  function legacyNestedString(record: object | null, parent: string, key: string): string {
    if (!record) {
      return '';
    }
    const nested: unknown = (record as Record<string, unknown>)[parent];
    if (typeof nested !== 'object' || nested === null) {
      return '';
    }
    const value: unknown = (nested as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : '';
  }

  function assetPathFromUrl(url: string): `/${string}` {
    if (!url) {
      return '/';
    }
    try {
      const parsed = new URL(url, 'https://assets.ccw.site');
      const marker = '/assets/';
      const index = parsed.pathname.indexOf(marker);
      if (index < 0) {
        return '/';
      }
      return `/${parsed.pathname.slice(index + marker.length)}`;
    } catch {
      return '/';
    }
  }

  function slugFromUrl(url: string): string {
    return (url.match(/\/(?:post|article)\/([^/?]+)/) ?? [])[1] ?? '';
  }

  const { page }: { page: NotificationV3Item } = $props();

  const safePage = $derived.by((): NotificationView => {
    const raw = page.content ?? {};
    const url = typeof page.url === 'string' ? page.url : '';
    const subjectOutline =
      page.subjectOutline ||
      legacyNestedString(page, 'creationInfo', 'title') ||
      raw.subject_outline ||
      url;
    return {
      ...page,
      content: {
        ...raw,
        comments: page.comment ?? raw.comments ?? '',
        subject_oid: page.subjectOid ?? raw.subject_oid ?? '',
        subject_outline: subjectOutline,
        homework_title: raw.homework_title || subjectOutline,
        slug: raw.slug || legacyNestedString(raw, 'ext', 'slug') || slugFromUrl(url),
        remixed_creation_oid: legacyString(raw, 'remixed_creation_oid'),
        remixed_creation_title: legacyString(raw, 'remixed_creation_title') || subjectOutline,
      },
      senderInfo: {
        ...page.senderInfo,
        oid: page.senderInfo?.oid ?? page.senderOid ?? '',
        name: page.senderInfo?.name ?? page.senderName ?? '',
        avatar: page.senderInfo?.avatar ?? '',
      },
      extensionInfo: page.extensionInfo ?? {},
      assetMarketInfo: {
        ...page.assetMarketInfo,
        path: page.assetMarketInfo?.path || assetPathFromUrl(url),
      },
      creationInfo: { title: legacyNestedString(page, 'creationInfo', 'title') },
    };
  });

  let component = $derived.by(() => {
    switch (page.contentCategory) {
      case 'CREATION_FAVORITE':
        return creationFavorite;
      case 'CREATION_LIKED':
        return creationLiked;
      case 'CREATION_REMIXED':
        return creationRemixed;
      case 'CREATION_COMMENTED':
        return creationCommented;
      case 'CREATION_COMMENT_REPLIED':
        return creationCommentReplied;
      case 'CREATION_SHARE':
        return creationShare;
      case 'CREATION_RECOMMENDED_AS_POTENTIAL':
        return creationRecommendedAsPotential;
      case 'CREATION_CHECKED':
        return creationChecked;
      case 'EXTENSION_LIKED':
        return extensionLiked;
      case 'EXTENSION_COMMENTED':
        return extensionCommented;
      case 'EXTENSION_COMMENT_REPLIED':
        return extensionCommentReplied;
      case 'POST_FAVORITE':
        return postFavorite;
      case 'POST_LIKED':
        return postLiked;
      case 'POST_COMMENT':
        return postComment;
      case 'POST_VISIBILITY_CHANGED':
        return postVisibilityChange;
      case 'ASSET_MARKET_LIKED':
        return assetMarketLiked;
      case 'ASSET_MARKET_DONATE':
        return assetMarketDonate;
      case 'TEAM_COMMENTED':
        return teamCommented;
      case 'FRIEND_INVITE':
        return friendInvite;
      case 'PROFILE_LEAVE_WORDS':
        return profileLeaveWords;
      case 'FOLLOWED':
        return followed;
      case 'SESSION_CREATED':
        return sessionCreated;
      case 'COMMUNITY_ACTIVITY':
        return communityActivity;
      case 'ASSET_MARKET_PURCHASED':
        return assetMarketPurchased;
      case 'COMMENT_DELETED':
        return commentDeleted;
      case 'POST_RATED_AS_EXCELLENT':
        return postRatedAsExcellent;
      case 'REPORT_LOG_REJECTED':
        return reportLogRejected;
      case 'CREATION_BANNED':
        return creationBanned;
      case 'CREATION_AUDIT_PASSED':
        return creationAuditPassed;
      default:
        return systemNotice;
    }
  });
</script>

<div class="inline *:inline">
  {@render component(safePage)}
</div>

{#snippet ____TODO_RAW(page: NotificationView)}
  <span class="whitespace-break-spaces">{JSON.stringify(page, null, 2)}</span>
{/snippet}

{#snippet systemNotice(page: NotificationView)}
  {@const html = page.comment || page.content?.comments}
  {#if html}
    <SystemNoticeHtml text={html} />
  {:else if page.title}
    <span class="text-text-primary font-medium">{page.title}</span>
  {:else}
    {@render ____TODO_RAW(page)}
  {/if}
{/snippet}

{#snippet senderLink(page: NotificationView)}
  {#if page.senderInfo.oid}
    <a href="/user/{page.senderInfo.oid}" class={userLinkClass}>
      {page.senderInfo.name || '用户'}
    </a>
  {:else}
    <span class={userLinkClass}>{page.senderInfo.name || '用户'}</span>
  {/if}
{/snippet}

{#snippet ____PLACEHOLDER(page: NotificationView)}
  <div class="flex flex-col gap-1">
    <div class="inline">
      {@render senderLink(page)}
      <span class="text-text-placeholder">发来了一条新通知</span>
    </div>
    <span class="text-text-placeholder text-xs">
      （该通知类型{page.contentCategory}暂未支持，点击展开查看原始数据）
    </span>
    <details class="text-text-placeholder text-xs">
      <summary class="hover:text-text-secondary cursor-pointer">查看原始数据</summary>
      <pre
        class="bg-bg-secondary mt-1 rounded-lg p-2 break-all whitespace-pre-wrap">{JSON.stringify(
          page,
          null,
          2,
        )}</pre>
    </details>
  </div>
{/snippet}

{#snippet invisibleSubject()}
  <span class="text-text-placeholder italic" title="作品已下架或不可见">作品不可见</span>
{/snippet}

{#snippet creationFavorite(page: CREATION_FAVORITE)}
  你的作品
  <NotificationSubjectLink href="/detail/{page.content.subject_oid}">
    {page.content.subject_outline}
  </NotificationSubjectLink>
  被
  {@render senderLink(page)}
  加入了收藏
{/snippet}

{#snippet creationLiked(page: CREATION_LIKED)}
  {@render senderLink(page)}
  为你的作品
  <NotificationSubjectLink href="/detail/{page.content.subject_oid}">
    {page.content.homework_title}
  </NotificationSubjectLink>
  点了个赞
  <LikeIcon like_icon={page.content.like_icon ?? undefined}></LikeIcon>
{/snippet}

{#snippet creationRemixed(page: CREATION_REMIXED)}
  你的作品
  <NotificationSubjectLink href="/detail/{page.content.remixed_creation_oid}">
    {page.content.remixed_creation_title}
  </NotificationSubjectLink>
  被
  {@render senderLink(page)}
  改编为了新作品
  <NotificationSubjectLink href="/detail/{page.content.subject_oid}">
    {page.content.subject_outline}
  </NotificationSubjectLink>
{/snippet}

{#snippet creationCommented(page: CREATION_COMMENTED)}
  {@const subjectOid = page.subjectOid || page.content?.subject_oid}
  {@const subjectName =
    page.creationInfo?.title || page.content?.subject_outline || page.subjectOutline}
  {@const detailUrl = page.url || (subjectOid ? `/detail/${subjectOid}` : '')}
  {@const commentText = page.comment || page.content?.comments}
  <div class="flex w-full flex-col">
    <div class="*:inline">
      {@render senderLink(page)}
      在你的作品
      {#if detailUrl}
        <NotificationSubjectLink href={detailUrl} commentId={page.triggeredById ?? undefined}>
          {subjectName || '作品'}
        </NotificationSubjectLink>
      {:else}
        <span class="text-text-placeholder italic">作品</span>
      {/if}
      下评论:
    </div>
    <div class="bg-bg-secondary border-border w-full rounded-lg border p-2 whitespace-break-spaces">
      {#if commentText}
        <RenderComment comment={commentText}></RenderComment>
      {:else}
        <span class="text-text-placeholder italic" title="评论内容已不可访问">
          评论内容已不可访问
        </span>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet creationCommentReplied(page: CREATION_COMMENT_REPLIED)}
  <div class="flex w-full flex-col">
    <div class="*:inline">
      {@render senderLink(page)}
      回复了你在作品
      <NotificationSubjectLink
        href="/detail/{page.content.subject_oid}"
        commentId={page.triggeredById ?? undefined}
      >
        {page.content.subject_outline}
      </NotificationSubjectLink>
      下的评论:
    </div>
    <div class="bg-bg-secondary border-border w-full rounded-t-lg border p-2">
      <RenderComment comment={page.content.comments}></RenderComment>
    </div>
    {#if $user.loggedIn}
      <div class="bg-bg-tertiary text-text-secondary border-border w-full rounded-b-lg border p-2">
        <a href="/user/{$user.oid}" class={userLinkClass}>@{$user.name}</a>: <RenderComment
          comment={page.message}
        ></RenderComment>
      </div>
    {/if}
  </div>
{/snippet}

{#snippet creationShare(page: CREATION_SHARE)}
  {@const subjectOid = page.content?.subject_oid}
  {@const subjectName = page.content?.subject_outline}
  <div class="flex w-full flex-col">
    <div class="*:inline">
      {@render senderLink(page)}
      向你分享了作品
      {#if subjectOid}
        <NotificationSubjectLink href="/detail/{subjectOid}">
          {subjectName || '作品不可见'}
        </NotificationSubjectLink>
      {:else}
        {@render invisibleSubject()}
      {/if}
    </div>
  </div>
{/snippet}

{#snippet creationRecommendedAsPotential(page: CREATION_RECOMMENDED_AS_POTENTIAL)}
  你的作品
  <NotificationSubjectLink href="/detail/{page.content.subject_oid}">
    {page.content.subject_outline}
  </NotificationSubjectLink>
  已被评为[潜力新作]
{/snippet}

{#snippet creationChecked(page: CREATION_CHECKED)}
  你的作品
  <NotificationSubjectLink href="/detail/{page.content.subject_oid}">
    {page.content.subject_outline}
  </NotificationSubjectLink>
  通过了审核
{/snippet}

{#snippet extensionLiked(page: EXTENSION_LIKED)}
  {@render senderLink(page)}
  为你的扩展
  <NotificationSubjectLink href="https://assets.ccw.site/extension/{page.extensionInfo.eid}">
    {page.content.subject_outline}
  </NotificationSubjectLink>
  点了个赞
{/snippet}

{#snippet extensionCommented(page: EXTENSION_COMMENTED)}
  <div class="flex flex-col">
    <div class="*:inline">
      {@render senderLink(page)}
      在你的扩展
      <NotificationSubjectLink
        href="https://assets.ccw.site/extension/{page.extensionInfo.eid}"
        commentId={page.triggeredById ?? undefined}
      >
        {page.extensionInfo.name}
      </NotificationSubjectLink>
      下留言
    </div>
    <div class="bg-bg-secondary border-border w-full rounded-lg border p-2 whitespace-break-spaces">
      <RenderComment comment={page.content.comments}></RenderComment>
    </div>
  </div>
{/snippet}

{#snippet extensionCommentReplied(page: EXTENSION_COMMENT_REPLIED)}
  <div class="flex flex-col">
    <div class="*:inline">
      {@render senderLink(page)}
      回复了你在扩展
      <NotificationSubjectLink
        href="https://assets.ccw.site/extension/{page.extensionInfo.eid}"
        commentId={page.triggeredById ?? undefined}
      >
        {page.extensionInfo.name}
      </NotificationSubjectLink>
      的评论
    </div>
    <div class="bg-bg-secondary border-border w-full rounded-t-lg border p-2">
      <RenderComment comment={page.content.comments}></RenderComment>
    </div>
    {#if $user.loggedIn}
      <div class="bg-bg-tertiary text-text-secondary border-border w-full rounded-b-lg border p-2">
        <a href="/user/{$user.oid}" class={userLinkClass}>@{$user.name}</a>:
        <RenderComment comment={page.message}></RenderComment>
      </div>
    {/if}
  </div>
{/snippet}

{#snippet postFavorite(page: POST_FAVORITE)}
  你的文章
  <NotificationSubjectLink href="https://www.ccw.site/post/{page.content.slug}">
    {page.content.subject_outline}
  </NotificationSubjectLink>
  被
  {@render senderLink(page)}
  加入了收藏
{/snippet}

{#snippet postLiked(page: POST_LIKED)}
  {@render senderLink(page)}
  为你的文章
  <NotificationSubjectLink href="https://www.ccw.site/post/{page.content.slug}">
    {page.content.subject_outline}
  </NotificationSubjectLink>
  点了个赞
{/snippet}

{#snippet postComment(page: POST_COMMENT)}
  {@const slug = page.content.slug}
  <div class="flex w-full flex-col">
    <div class="*:inline">
      {@render senderLink(page)}
      {#if page.message && $user.loggedIn}
        回复了你在文章
        {#if slug}
          <NotificationSubjectLink
            href="https://www.ccw.site/post/{slug}"
            commentId={page.triggeredById ?? undefined}
          >
            {page.content.subject_outline}
          </NotificationSubjectLink>
        {:else}
          <span class="text-text-placeholder italic" title="文章已下架或不可见">文章不可见</span>
        {/if}
        中的留言
      {:else}
        在你的文章
        {#if slug}
          <NotificationSubjectLink
            href="https://www.ccw.site/post/{slug}"
            commentId={page.triggeredById ?? undefined}
          >
            {page.content.subject_outline}
          </NotificationSubjectLink>
        {:else}
          <span class="text-text-placeholder italic" title="文章已下架或不可见">文章不可见</span>
        {/if}
        下留言:
      {/if}
    </div>
    <div
      class="bg-bg-secondary w-full {page.message
        ? 'rounded-t-lg'
        : 'rounded-lg'} border-border border p-2"
    >
      <RenderComment comment={page.content.comments}></RenderComment>
    </div>
    {#if page.message && $user.loggedIn}
      <div class="bg-bg-tertiary text-text-secondary border-border w-full rounded-b-lg border p-2">
        <a href="/user/{$user.oid}" class={userLinkClass}>@{$user.name}</a>:
        <RenderComment comment={page.message}></RenderComment>
      </div>
    {/if}
  </div>
{/snippet}

{#snippet postVisibilityChange(page: POST_VISIBILITY_CHANGED)}
  <RenderHTML
    text={(page.comment ?? '').replace('/post/', 'https://www.ccw.site/post/')}
    config={{
      ALLOW_UNKNOWN_PROTOCOLS: false,
      ALLOWED_ATTR: ['href', 'target'],
    }}
  ></RenderHTML>
{/snippet}

{#snippet assetMarketLiked(page: ASSET_MARKET_LIKED)}
  {@render senderLink(page)}
  为你的素材
  <NotificationSubjectLink href="https://assets.ccw.site/assets{page.assetMarketInfo.path}">
    {page.content.subject_outline}
  </NotificationSubjectLink>
  点了个赞
{/snippet}

{#snippet assetMarketDonate(page: ASSET_MARKET_DONATE)}
  {@render senderLink(page)}
  为你的素材
  <NotificationSubjectLink href="https://assets.ccw.site/assets{page.assetMarketInfo.path}">
    {page.content.subject_outline}
  </NotificationSubjectLink>
  投了币
{/snippet}

{#snippet teamCommented(page: TEAM_COMMENTED)}
  <div class="flex w-full flex-col">
    <div class="*:inline">
      {@render senderLink(page)}
      {#if page.message && $user.loggedIn}
        回复了你在战队
        <NotificationSubjectLink
          href="https://www.ccw.site/gamejam/teamDetail?id={page.content.subject_oid}"
          commentId={page.triggeredById ?? undefined}
          target="_blank"
        >
          {page.content.subject_outline}
        </NotificationSubjectLink>
        中的留言
      {:else}
        在你的战队
        <NotificationSubjectLink
          href="https://www.ccw.site/gamejam/teamDetail?id={page.content.subject_oid}"
          commentId={page.triggeredById ?? undefined}
          target="_blank"
        >
          {page.content.subject_outline}
        </NotificationSubjectLink>下留言:
      {/if}
    </div>
    <div
      class="bg-bg-secondary w-full {page.message
        ? 'rounded-t-lg'
        : 'rounded-lg'} border-border border p-2"
    >
      <RenderComment comment={page.content.comments}></RenderComment>
    </div>
    {#if page.message && $user.loggedIn}
      <div class="bg-bg-tertiary text-text-secondary border-border w-full rounded-b-lg border p-2">
        <a href="/user/{$user.oid}" class={userLinkClass}>@{$user.name}</a>:
        <RenderComment comment={page.message}></RenderComment>
      </div>
    {/if}
  </div>
{/snippet}

{#snippet friendInvite(page: FRIEND_INVITE)}
  <div class="flex w-full flex-col">
    <div class="*:inline">
      {@render senderLink(page)}
      向你发出了邀请
      <RenderHTML text={page.message ?? ''}></RenderHTML>
    </div>
  </div>
{/snippet}

{#snippet profileLeaveWords(page: PROFILE_LEAVE_WORDS)}
  {@const boardOid = page.subjectOid || page.content?.subject_oid}
  {@const comments = page.comment || page.content?.comments}
  {@const unavailable = page.title || !comments}
  <div class="flex w-full flex-col">
    <div class="*:inline">
      {@render senderLink(page)}
      {#if page.message && $user.loggedIn}
        回复了你在
        {#if boardOid}
          <NotificationSubjectLink
            href="/user/{boardOid}"
            commentId={page.triggeredById ?? undefined}
          >
            留言板
          </NotificationSubjectLink>
        {:else}
          <span class="text-text-placeholder italic">留言板</span>
        {/if}
        中的留言
      {:else}
        在你的
        <NotificationSubjectLink
          href="/user/{boardOid || ($user.loggedIn && $user.oid)}"
          commentId={page.triggeredById ?? undefined}
        >
          留言板
        </NotificationSubjectLink>
        下留言:
      {/if}
    </div>
    <div
      class="bg-bg-secondary border-border w-full border whitespace-break-spaces {page.message
        ? 'rounded-t-lg'
        : 'rounded-lg'} p-2"
    >
      {#if unavailable}
        <span
          class="text-text-placeholder italic"
          title={unavailable === true ? '留言内容已不可访问' : unavailable}
        >
          {unavailable === true ? '留言内容已不可访问' : unavailable}
        </span>
      {:else}
        <RenderComment comment={comments}></RenderComment>
      {/if}
    </div>
    {#if page.message && $user.loggedIn}
      <div
        class="bg-bg-tertiary border-border text-text-secondary flex w-full rounded-b-lg border p-2"
      >
        <a href="/user/{$user.oid}" class={userLinkClass}>
          @{$user.name}
        </a>: <RenderComment comment={page.message}></RenderComment>
      </div>
    {/if}
  </div>
{/snippet}

{#snippet followed(page: FOLLOWED)}
  {@render senderLink(page)}
  关注了你
{/snippet}

{#snippet sessionCreated(page: SESSION_CREATED)}
  {@const sessionId = page.triggeredById || page.id}
  <div class="flex w-full flex-col gap-1.5">
    <span class="text-text-primary">{page.comment || page.title}</span>
    {#if sessionId}
      <a
        href="/settings/auth?session={sessionId}"
        class="bg-bg-secondary text-text-secondary border-border hover:bg-bg-tertiary inline-flex w-fit items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition-colors duration-100"
        title="跳转到设备管理并定位到此登录会话"
      >
        <svg
          class="size-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        管理该设备
      </a>
    {/if}
  </div>
{/snippet}

{#snippet communityActivity(page: COMMUNITY_ACTIVITY)}
  <RenderHTML
    text={page.comment ?? ''}
    config={{
      ALLOW_UNKNOWN_PROTOCOLS: false,
    }}
  ></RenderHTML>
{/snippet}

{#snippet assetMarketPurchased(page: ASSET_MARKET_PURCHASED)}
  {@render senderLink(page)}
  将你的素材
  <NotificationSubjectLink
    href="https://assets.ccw.site/assets{page.assetMarketInfo.path}"
    target="_blank"
  >
    {page.content.subject_outline}
  </NotificationSubjectLink>
  加入了背包
{/snippet}

{#snippet commentDeleted(page: COMMENT_DELETED)}
  {@render ____PLACEHOLDER(page)}
{/snippet}

{#snippet postRatedAsExcellent(page: POST_RATED_AS_EXCELLENT)}
  {@render ____PLACEHOLDER(page)}
{/snippet}

{#snippet creationBanned(page: CREATION_BANNED)}
  {@const title = page.title || '作品处理通知'}
  {@const subject = page.content?.subject_outline || page.subjectOutline || '你的作品'}
  {@const subjectUrl =
    page.target?.url || (page.content?.subject_oid ? `/detail/${page.content.subject_oid}` : '')}
  {@const detail = page.content?.comments || page.comment || ''}
  <div class="flex w-full flex-col gap-2">
    <div class="*:inline">
      <span class="text-error font-semibold">{title}</span>
      {#if subjectUrl}
        <NotificationSubjectLink href={subjectUrl}>{subject}</NotificationSubjectLink>
      {:else}
        <span class="text-text-primary font-medium">{subject}</span>
      {/if}
    </div>
    {#if detail}
      <div
        class="bg-bg-secondary border-border text-text-secondary [&_a]:text-primary w-full rounded-lg border p-2 text-sm leading-relaxed whitespace-break-spaces [&_a]:underline"
      >
        {@html DOMPurify.sanitize(detail, systemNoticePurifyConfig)}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet creationAuditPassed(page: NotificationView)}
  {@const detail = page.content?.comments || page.comment || ''}
  <div class="flex w-full flex-col gap-2">
    <div class="*:inline">
      <span class="text-success font-semibold">{page.title || '作品审核通知'}</span>
    </div>
    {#if detail}
      <div
        class="bg-bg-secondary border-border text-text-secondary [&_a]:text-primary w-full rounded-lg border p-2 text-sm leading-relaxed whitespace-break-spaces [&_a]:underline"
      >
        {@html DOMPurify.sanitize(detail, systemNoticePurifyConfig)}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet reportLogRejected(page: REPORT_LOG_REJECTED)}
  {@render ____PLACEHOLDER(page)}
{/snippet}
