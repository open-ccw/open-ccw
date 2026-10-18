<script lang="ts">
  import { communityWeb } from '@ccw-api/api';
  import type { Snippet } from 'svelte';
  import AvatarToProfile from '#lib/user/AvatarToProfile.svelte';
  import ApprovalDisplay from '#lib/user/ApprovalDisplay.svelte';
  import { toast } from '#lib';
  import { user } from '#lib/user/userStore.ts';
  import { formatRelativeTime } from '#lib/utils/time.ts';
  import RenderComment from './RenderComment.svelte';
  import up from '#lib/assets/arrow-up-from-line.svg?raw';
  import type { MinimalComment } from './types';

  let {
    comment,
    compact = false,
    replyActive = false,
    onLike,
    onReply,
    children,
  }: {
    /** 要展示的评论/回复 */
    comment: MinimalComment & { receiver?: { name: string } | null; replyToId?: number };
    /** 紧凑模式（回复列表用），头像与昵称更小且隐藏勋章 */
    compact?: boolean;
    /** 回复按钮是否处于激活态 */
    replyActive?: boolean;
    /** 点赞成功后的回调，参数为最新的点赞状态与数量 */
    onLike(liked: boolean, likeCount: number): void;
    /** 点击回复按钮的回调 */
    onReply(): void;
    /** 额外内容（回复框、回复列表等），渲染在整条评论下方 */
    children?: Snippet;
  } = $props();

  /** 切换点赞并把最新状态回调给父组件 */
  async function toggleLike() {
    if (!$user.loggedIn) {
      toast.warning('请登录账号');
      return;
    }
    const success = comment.liked
      ? await communityWeb.unlikeComment(comment.id)
      : await communityWeb.likeComment(comment.id);
    if (success) {
      onLike(!comment.liked, comment.likeCount + (comment.liked ? -1 : 1));
    }
  }
</script>

<div class="flex gap-3">
  <!-- 头像 -->
  <div class="{compact ? 'size-6' : 'size-10'} shrink-0">
    <AvatarToProfile
      oid={comment.commenter.accountOid}
      url={comment.commenter.avatar}
      virtual={comment.commenter.virtualValue}
    ></AvatarToProfile>
  </div>

  <!-- 内容区 -->
  <div class="min-w-0 flex-1">
    <div class="mb-1 flex {compact ? 'items-center' : ''}">
      <!-- 用户信息和勋章 -->
      <div class="flex gap-2">
        <a
          href="/user/{comment.commenter.accountOid}"
          class="text-text-secondary hover:text-primary shrink-0 font-semibold transition-colors {compact
            ? 'text-xs'
            : 'text-base'}"
        >
          {comment.commenter.name}
        </a>
        {#if !compact}
          <ApprovalDisplay
            approvals={comment.commenter.approvalTagRelations}
            oid={comment.commenter.accountOid}
            showHidden={false}
          ></ApprovalDisplay>
        {/if}
      </div>
      {#if comment.weight}
        <div class="text-star size-6" aria-label="该评论被置顶" title="该评论被置顶">
          {@html up}
        </div>
      {/if}
    </div>

    <!-- 评论内容 -->
    <div class="text-text-secondary {compact ? '' : 'mb-2'} text-sm leading-relaxed">
      <RenderComment
        comment={comment.content}
        id={comment.id}
        replyToId={comment.replyToId}
        receiverName={comment.receiver?.name}
      ></RenderComment>
    </div>

    <!-- 时间和操作栏 -->
    <div class="flex items-center justify-between gap-4">
      {#if comment.createdAt}
        <span class="text-text-placeholder text-xs">{formatRelativeTime(comment.createdAt)}</span>
      {/if}

      <!-- 操作栏 -->
      <div class="flex items-center gap-4">
        <button
          class="flex cursor-pointer items-center gap-1 text-xs transition-colors {replyActive
            ? 'text-primary'
            : 'text-text-placeholder hover:text-primary'}"
          onclick={onReply}
        >
          <svg
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>回复{comment.replyCount ?? ''}</span>
        </button>
        <button
          class="text-text-placeholder hover:text-error flex cursor-pointer items-center gap-1 text-xs transition-colors"
          onclick={toggleLike}
        >
          <svg
            class="size-4"
            viewBox="0 0 24 24"
            fill={comment.liked ? 'red' : 'none'}
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>点赞</span>
          <span>{comment.likeCount}</span>
        </button>
      </div>
    </div>
  </div>
</div>

{@render children?.()}
