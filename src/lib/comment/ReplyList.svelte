<script lang="ts">
  import { communityWeb, type Comment } from '@ccw-api/api';
  import CommentItem from './CommentItem.svelte';
  import WriteComment from './WriteComment.svelte';
  import { toast } from '#lib';
  import { user } from '#lib/user/userStore.ts';
  import type { ReplyTarget, TopicConfig } from './types';

  let {
    topicId,
    parentId,
    replyCount = 0,
    expandToken = 0,
    oid,
    subjectType,
    sectionType,
    onReplied,
  }: {
    /** 评论所属话题 id */
    topicId: number;
    /** 父评论 id */
    parentId: number;
    /** 已有回复数，折叠态展示 */
    replyCount?: number;
    /** 每次自增都触发重新拉取并展开，用于发送回复后自动展开 */
    expandToken?: number;
    /** 回复发送成功后的回调，用于让父组件同步回复计数 */
    onReplied?(): void;
  } & TopicConfig = $props();

  let expanded = $state(false);
  let loading = $state(false);
  let error = $state('');
  let replies = $state.raw<Comment.Comment[]>([]);
  // 当前展开回复框的回复，非空时在该条回复下方挂回复输入框
  let replyTarget = $state<ReplyTarget | null>(null);

  /** 逐页拉取全部回复，回复量通常很少，一次取完省去再点「加载更多」 */
  async function loadAll() {
    loading = true;
    error = '';
    const all: Comment.Comment[] = [];
    try {
      for (let page = 1; ; page += 1) {
        const { data, totalPages } = await communityWeb.getCommentReplies(
          topicId,
          parentId,
          undefined,
          { page, perPage: 100 },
        );
        all.push(...data);
        if (data.length === 0 || page >= totalPages) {
          break;
        }
      }
      replies = all;
      expanded = true;
    } catch (e) {
      error = String(e);
    }
    loading = false;
  }

  /** 切换展开/收起，首次展开时拉取回复 */
  function toggle() {
    if (expanded) {
      expanded = false;
    } else if (replies.length > 0) {
      expanded = true;
    } else {
      loadAll();
    }
  }

  // expandToken 变化（父组件发送回复成功）时重新拉取并展开
  $effect(() => {
    if (expandToken > 0) {
      loadAll();
    }
  });
</script>

{#if error}
  <div class="text-error mt-2 flex items-center gap-2 text-xs">
    <span>{error}</span>
    <button class="cursor-pointer underline" onclick={loadAll}>重试</button>
  </div>
{:else if replyCount > 0}
  <button
    class="text-text-placeholder hover:text-primary mt-2 cursor-pointer text-xs transition-colors duration-100"
    onclick={toggle}
  >
    {expanded ? `收起 ${replyCount} 条回复` : `查看 ${replyCount} 条回复`}
  </button>
{/if}
{#if expanded}
  <div class="border-border mt-2 flex flex-col gap-3 border-l pl-3">
    {#if loading && replies.length === 0}
      <span class="text-text-placeholder text-xs">加载回复中...</span>
    {:else if replies.length === 0}
      <span class="text-text-placeholder text-xs">暂无回复</span>
    {:else}
      {#each replies as reply, i (reply.id)}
        <CommentItem
          comment={reply}
          compact
          replyActive={replyTarget?.id === reply.id}
          onLike={(liked, likeCount) => {
            const next = [...replies];
            next[i] = { ...reply, liked, likeCount };
            replies = next;
          }}
          onReply={() => {
            if (!$user.loggedIn) {
              toast.warning('请登录账号');
              return;
            }
            replyTarget =
              replyTarget?.id === reply.id
                ? null
                : { id: reply.id, topicId, name: reply.commenter.name, replyCount: 0 };
          }}
        >
          {#if replyTarget?.id === reply.id}
            <!-- 回复框复用 WriteComment，挂在该条回复下方 -->
            <div class="mt-2">
              <WriteComment
                {oid}
                {subjectType}
                {sectionType}
                {replyTarget}
                onCancelReply={() => {
                  replyTarget = null;
                }}
                onReplied={() => {
                  // 回复成功后关闭输入框，由父组件 bump expandToken 重新拉取并展开
                  replyTarget = null;
                  onReplied?.();
                }}
              />
            </div>
          {/if}
        </CommentItem>
      {/each}
    {/if}
  </div>
{/if}
