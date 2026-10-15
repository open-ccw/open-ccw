<script lang="ts">
  import type {
    COMMUNITY_ACTIVITY,
    CREATION_COMMENTED,
    CREATION_FAVORITE,
    CREATION_LIKED,
    CREATION_REMIXED,
    CREATION_CHECKED,
    EXTENSION_LIKED,
    FOLLOWED,
    Notification,
    POST_FAVORITE,
    POST_LIKED,
    POST_VISIBILITY_CHANGED,
    SESSION_CREATED,
    PROFILE_LEAVE_WORDS,
    ASSET_MARKET_PURCHASED,
    COMMENT_DELETED,
    CREATION_BANNED,
    REPORT_LOG_REJECTED,
    POST_RATED_AS_EXCELLENT,
    CREATION_COMMENT_REPLIED,
    CREATION_SHARE,
    CREATION_RECOMMENDED_AS_POTENTIAL,
    EXTENSION_COMMENTED,
    EXTENSION_COMMENT_REPLIED,
    POST_COMMENT,
    ASSET_MARKET_LIKED,
    ASSET_MARKET_DONATE,
    FRIEND_INVITE,
    TEAM_COMMENTED,
  } from "@ccw-api/api";
  import LikeIcon from "./LikeIcon.svelte";
  import RenderHTML from "#lib/utils/RenderHTML.svelte";
  import { user } from "#lib/user/userStore.ts";
  import RenderComment from "../comment/RenderComment.svelte";

  const userLinkClass =
    "font-medium text-info hover:underline whitespace-break-spaces";
  const subjectLinkClass = "font-medium text-primary hover:underline";

  const {
    page,
  }: {
    page: Notification.NotificationPage;
  } = $props();

  let component = $derived.by(() => {
    switch (page.contentCategory) {
      case "CREATION_FAVORITE":
        return creationFavorite;
      case "CREATION_LIKED":
        return creationLiked;
      case "CREATION_REMIXED":
        return creationRemixed;
      case "CREATION_COMMENTED":
        return creationCommented;
      case "CREATION_COMMENT_REPLIED":
        return creationCommentReplied;
      case "CREATION_SHARE":
        return creationShare;
      case "CREATION_RECOMMENDED_AS_POTENTIAL":
        return creationRecommendedAsPotential;
      case "CREATION_CHECKED":
        return creationChecked;
      case "EXTENSION_LIKED":
        return extensionLiked;
      case "EXTENSION_COMMENTED":
        return extensionCommented;
      case "EXTENSION_COMMENT_REPLIED":
        return extensionCommentReplied;
      case "POST_FAVORITE":
        return postFavorite;
      case "POST_LIKED":
        return postLiked;
      case "POST_COMMENT":
        return postComment;
      case "POST_VISIBILITY_CHANGED":
        return postVisibilityChange;
      case "ASSET_MARKET_LIKED":
        return assetMarketLiked;
      case "ASSET_MARKET_DONATE":
        return assetMarketDonate;
      case "TEAM_COMMENTED":
        return teamCommented;
      case "FRIEND_INVITE":
        return friendInvite;
      case "PROFILE_LEAVE_WORDS":
        return profileLeaveWords;
      case "FOLLOWED":
        return followed;
      case "SESSION_CREATED":
        return sessionCreated;
      case "COMMUNITY_ACTIVITY":
        return communityActivity;
      case "ASSET_MARKET_PURCHASED":
        return assetMarketPurchased;
      case "COMMENT_DELETED":
        return commentDeleted;
      case "POST_RATED_AS_EXCELLENT":
        return postRatedAsExcellent;
      case "REPORT_LOG_REJECTED":
        return reportLogRejected;
      case "CREATION_BANNED":
        return creationBanned;
      default:
        return ____TODO_RAW;
    }
  });
</script>

<div class="inline">
  {@render component(page as any)}
</div>

{#snippet ____TODO_RAW(page: any)}
  <span class="whitespace-break-spaces">{JSON.stringify(page, null, 2)}</span>
{/snippet}

{#snippet ____PLACEHOLDER(page: any)}
  <div class="flex flex-col gap-1">
    <div class="inline">
      <a href="/user/{page.senderInfo?.oid}" class={userLinkClass}
        >{page.senderInfo?.name ?? "用户"}</a
      >
      <span class="text-text-placeholder">发来了一条新通知</span>
    </div>
    <span class="text-xs text-text-placeholder"
      >（该通知类型{page.contentCategory}暂未支持，点击展开查看原始数据）</span
    >
    <details class="text-xs text-text-placeholder">
      <summary class="cursor-pointer hover:text-text-secondary"
        >查看原始数据</summary
      >
      <pre
        class="whitespace-pre-wrap break-all bg-bg-secondary rounded-lg p-2 mt-1">{JSON.stringify(
          page,
          null,
          2,
        )}</pre>
    </details>
  </div>
{/snippet}

{#snippet creationFavorite(page: CREATION_FAVORITE)}
  你的作品
  <a href="/detail/{page.content.subject_oid}" class={subjectLinkClass}>
    {page.content.subject_outline}
  </a>
  被
  <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
    >{page.senderInfo.name}</a
  >
  加入了收藏
{/snippet}

{#snippet creationLiked(page: CREATION_LIKED)}
  <a href="/user/{page.content.subject_oid}" class={userLinkClass}
    >{page.senderInfo.name}</a
  >
  为你的作品
  <a href="/detail/{page.content.subject_oid}" class={subjectLinkClass}>
    {page.content.homework_title}
  </a>
  点了个赞
  <LikeIcon like_icon={page.content.like_icon}></LikeIcon>
{/snippet}

{#snippet creationRemixed(page: CREATION_REMIXED)}
  你的作品
  <a
    href="/detail/{page.content.remixed_creation_oid}"
    class={subjectLinkClass}
  >
    {page.content.remixed_creation_title}
  </a>
  被
  <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
    >{page.senderInfo.name}</a
  >
  改编为了新作品
  <a href="/detail/{page.content.subject_oid}" class={subjectLinkClass}>
    {page.content.subject_outline}
  </a>
{/snippet}

{#snippet creationCommented(page: CREATION_COMMENTED)}
  <div class="flex w-full flex-col">
    <div class="inline">
      <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
        >{page.senderInfo.name}</a
      >
      在你的作品
      <a href="/detail/{page.content.subject_oid}}" class={subjectLinkClass}>
        {page.content.subject_outline}
      </a>
      下评论:
    </div>
    <div
      class="whitespace-break-spaces w-full bg-bg-secondary rounded-lg p-2 border border-border"
    >
      <RenderComment comment={page.content.comments}></RenderComment>
    </div>
  </div>
{/snippet}

{#snippet creationCommentReplied(page: CREATION_COMMENT_REPLIED)}
  <div class="flex w-full flex-col">
    <div class="inline">
      <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
        >{page.senderInfo.name}</a
      >
      回复了你在作品
      <a href="/detail/{page.content.subject_oid}}" class={subjectLinkClass}>
        {page.content.subject_outline}
      </a>
      下的评论:
    </div>
    <div class="w-full bg-bg-secondary rounded-t-lg p-2 border border-border">
      <RenderComment comment={page.content.comments}></RenderComment>
    </div>
    {#if $user.loggedIn}
      <div
        class="w-full bg-bg-tertiary rounded-b-lg p-2 text-text-secondary border border-border"
      >
        <a href="/user/{$user.oid}" class={userLinkClass}>@{$user.name}</a>: <RenderComment
          comment={page.message}
        ></RenderComment>
      </div>
    {/if}
  </div>
{/snippet}

{#snippet creationShare(page: CREATION_SHARE)}
  <div class="flex w-full flex-col">
    <div class="inline">
      <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
        >{page.senderInfo.name}</a
      >
      向你分享了作品
      <a href="/detail/{page.content.subject_oid}" class={subjectLinkClass}>
        {page.content.subject_outline}
      </a>
    </div>
  </div>
{/snippet}

{#snippet creationRecommendedAsPotential(
  page: CREATION_RECOMMENDED_AS_POTENTIAL,
)}
  你的作品
  <a href="/detail/{page.content.subject_oid}" class={subjectLinkClass}>
    {page.content.subject_outline}
  </a>
  已被评为[潜力新作]
{/snippet}

{#snippet creationChecked(page: CREATION_CHECKED)}
  你的作品
  <a href="/detail/{page.content.subject_oid}" class={subjectLinkClass}>
    {page.content.subject_outline}
  </a>
  通过了审核
{/snippet}

{#snippet extensionLiked(page: EXTENSION_LIKED)}
  <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
    >{page.senderInfo.name}</a
  >
  为你的扩展
  <a
    href="https://assets.ccw.site/extension/{page.extensionInfo.eid}"
    class={subjectLinkClass}
  >
    {page.content.subject_outline}
  </a>
  点了个赞
{/snippet}

{#snippet extensionCommented(page: EXTENSION_COMMENTED)}
  <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
    >{page.senderInfo.name}</a
  >
  在你的扩展
  <a
    href="https://assets.ccw.site/extension/{page.extensionInfo.eid}"
    class={subjectLinkClass}>{page.extensionInfo.name}</a
  >
  下留言
  <div
    class="whitespace-break-spaces w-full bg-bg-secondary rounded-lg p-2 border border-border"
  >
    <RenderComment comment={page.content.comments}></RenderComment>
  </div>
{/snippet}

{#snippet extensionCommentReplied(page: EXTENSION_COMMENT_REPLIED)}
  <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
    >{page.senderInfo.name}</a
  >
  回复了你在扩展
  <a
    href="https://assets.ccw.site/extension/{page.extensionInfo.eid}"
    class={subjectLinkClass}>{page.extensionInfo.name}</a
  >
  的评论
  <div class="w-full bg-bg-secondary rounded-t-lg p-2 border border-border">
    <RenderComment comment={page.content.comments}></RenderComment>
  </div>
  {#if $user.loggedIn}
    <div
      class="w-full bg-bg-tertiary rounded-b-lg p-2 text-text-secondary border border-border"
    >
      <a href="/user/{$user.oid}" class={userLinkClass}>@{$user.name}</a>:
      <RenderComment comment={page.message}></RenderComment>
    </div>
  {/if}
{/snippet}

{#snippet postFavorite(page: POST_FAVORITE)}
  你的文章
  <a
    href="https://www.ccw.site/post/{page.content.slug}"
    class={subjectLinkClass}
  >
    {page.content.subject_outline}
  </a>
  被
  <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
    >{page.senderInfo.name}</a
  >
  加入了收藏
{/snippet}

{#snippet postLiked(page: POST_LIKED)}
  <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
    >{page.senderInfo.name}</a
  >
  为你的文章
  <a
    href="https://www.ccw.site/post/{page.content.slug}"
    class={subjectLinkClass}
  >
    {page.content.subject_outline}
  </a>
  点了个赞
{/snippet}

{#snippet postComment(page: POST_COMMENT)}
  <div class="flex w-full flex-col">
    <div class="inline">
      <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
        >{page.senderInfo.name}</a
      >
      {#if page.message && $user.loggedIn}
        回复了你在文章
        <a
          href="https://ccw.site/post/{page.content.ext.slug}"
          class={userLinkClass}>{page.content.subject_outline}</a
        >
        中的留言
      {:else}
        在你的文章<a
          href="https://ccw.site/post/{page.content.ext.slug}"
          class={userLinkClass}>{page.content.subject_outline}</a
        >下留言:
      {/if}
    </div>
    <div
      class="w-full bg-bg-secondary {page.message
        ? 'rounded-t-lg'
        : 'rounded-lg'} p-2 border border-border"
    >
      <RenderComment comment={page.content.comments}></RenderComment>
    </div>
    {#if page.message && $user.loggedIn}
      <div
        class="w-full bg-bg-tertiary rounded-b-lg p-2 text-text-secondary border border-border"
      >
        <a href="/user/{$user.oid}" class={userLinkClass}>@{$user.name}</a>:
        <RenderComment comment={page.message}></RenderComment>
      </div>
    {/if}
  </div>
{/snippet}

{#snippet postVisibilityChange(page: POST_VISIBILITY_CHANGED)}
  <RenderHTML
    text={page.comment.replace("/post/", "https://ccw.site/post/")}
    config={{
      ALLOW_UNKNOWN_PROTOCOLS: false,
      ALLOWED_ATTR: ["href", "target"],
    }}
  ></RenderHTML>
{/snippet}

{#snippet assetMarketLiked(page: ASSET_MARKET_LIKED)}
  <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
    >{page.senderInfo.name}</a
  >
  为你的素材
  <a
    href="https://assets.ccw.site/assets{page.assetMarketInfo.path}"
    class={subjectLinkClass}
  >
    {page.content.subject_outline}
  </a>
  点了个赞
{/snippet}

{#snippet assetMarketDonate(page: ASSET_MARKET_DONATE)}
  <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
    >{page.senderInfo.name}</a
  >
  为你的素材
  <a
    href="https://assets.ccw.site/assets{page.assetMarketInfo.path}"
    class={subjectLinkClass}
  >
    {page.content.subject_outline}
  </a>
  投了币
{/snippet}

{#snippet teamCommented(page: TEAM_COMMENTED)}
  <div class="flex w-full flex-col">
    <div class="inline">
      <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
        >{page.senderInfo.name}</a
      >
      {#if page.message && $user.loggedIn}
        回复了你在战队
        <a
          href="https://www.ccw.site/gamejam/teamDetail?id={page.content
            .subject_oid}"
          class={userLinkClass}
          target="_blank">{page.content.subject_outline}</a
        >
        中的留言
      {:else}
        在你的战队
        <a
          href="https://www.ccw.site/gamejam/teamDetail?id={page.content
            .subject_oid}"
          class={userLinkClass}
          target="_blank">{page.content.subject_outline}</a
        >下留言:
      {/if}
    </div>
    <div
      class="w-full bg-bg-secondary {page.message
        ? 'rounded-t-lg'
        : 'rounded-lg'} p-2 border border-border"
    >
      <RenderComment comment={page.content.comments}></RenderComment>
    </div>
    {#if page.message && $user.loggedIn}
      <div
        class="w-full bg-bg-tertiary rounded-b-lg p-2 text-text-secondary border border-border"
      >
        <a href="/user/{$user.oid}" class={userLinkClass}>@{$user.name}</a>:
        <RenderComment comment={page.message}></RenderComment>
      </div>
    {/if}
  </div>
{/snippet}

{#snippet friendInvite(page: FRIEND_INVITE)}
  <div class="flex w-full flex-col">
    <div class="inline">
      <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
        >{page.senderInfo.name}</a
      >
      向你发出了邀请
      <RenderHTML text={page.message}></RenderHTML>
    </div>
  </div>
{/snippet}

{#snippet profileLeaveWords(page: PROFILE_LEAVE_WORDS)}
  <div class="flex w-full flex-col">
    <div class="inline">
      <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
        >{page.senderInfo.name}</a
      >
      {#if page.message && $user.loggedIn}
        回复了你在
        <a href="/user/{page.content.subject_oid}" class={userLinkClass}
          >留言板</a
        >
        中的留言
      {:else}
        在你的留言板下留言:
      {/if}
    </div>
    <div
      class="whitespace-break-spaces w-full bg-bg-secondary border border-border {page.message
        ? 'rounded-t-lg'
        : 'rounded-lg'} p-2"
    >
      <RenderComment comment={page.content.comments}></RenderComment>
    </div>
    {#if page.message && $user.loggedIn}
      <div
        class="flex w-full bg-bg-tertiary border border-border rounded-b-lg p-2 text-text-secondary"
      >
        <a href="/user/{$user.oid}" class={userLinkClass}>
          @{$user.name}
        </a>: <RenderComment comment={page.message}></RenderComment>
      </div>
    {/if}
  </div>
{/snippet}

{#snippet followed(page: FOLLOWED)}
  <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
    >{page.senderInfo.name}</a
  >
  关注了你
{/snippet}

{#snippet sessionCreated(page: SESSION_CREATED)}
  <div>{page.comment}</div>
{/snippet}

{#snippet communityActivity(page: COMMUNITY_ACTIVITY)}
  <RenderHTML
    text={page.comment}
    config={{
      ALLOW_UNKNOWN_PROTOCOLS: false,
    }}
  ></RenderHTML>
{/snippet}

{#snippet assetMarketPurchased(page: ASSET_MARKET_PURCHASED)}
  <a href="/user/{page.senderInfo.oid}" class={userLinkClass}
    >{page.senderInfo.name}</a
  >
  将你的素材
  <a
    href="https://assets.ccw.site/assets{page.assetMarketInfo.path}"
    class={subjectLinkClass}
    target="_blank"
  >
    {page.content.subject_outline}
  </a>
  加入了背包
{/snippet}

{#snippet commentDeleted(page: COMMENT_DELETED)}
  {@render ____PLACEHOLDER(page)}
{/snippet}

{#snippet postRatedAsExcellent(page: POST_RATED_AS_EXCELLENT)}
  {@render ____PLACEHOLDER(page)}
{/snippet}

{#snippet creationBanned(page: CREATION_BANNED)}
  {@render ____PLACEHOLDER(page)}
{/snippet}

{#snippet reportLogRejected(page: REPORT_LOG_REJECTED)}
  {@render ____PLACEHOLDER(page)}
{/snippet}
