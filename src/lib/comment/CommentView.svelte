<script lang="ts">
  import { communityWeb } from '#lib/api';
  import { onMount, tick } from 'svelte';
  import type { MinimalComment, ReplyTarget, TopicConfig } from './types';
  import CommentItem from './CommentItem.svelte';
  import { toast } from '#lib';
  import { user } from '#lib/user/userStore.ts';
  import WriteComment from './WriteComment.svelte';
  import ReplyList from './ReplyList.svelte';

  const {
    oid,
    subjectType,
    sectionType,
    anchorCommentId,
  }: TopicConfig & {
    /** 锚点评论 id，传入后跳过普通分页，直接以该评论为锚点展示上下文并滚动定位 */
    anchorCommentId?: number;
  } = $props();
  let pageNum = $state(1);
  let totalPages = $state(Infinity);
  let loading = $state(false);
  let loadingMore = $state(false);
  let comments: MinimalComment[] = $state.raw([]);
  let footer: HTMLElement | null = $state(null);
  let observer: null | IntersectionObserver = $state(null);
  let error = $state('');
  // 当前展开回复框的评论 id，回复框复用 WriteComment 组件挂在该评论下方
  let replyTarget = $state<ReplyTarget | null>(null);
  // 每条评论的回复列表展开令牌，回复发送成功后自增以重新拉取并展开
  let replyExpandTokens = $state.raw<Record<number, number>>({});

  // 是否还有更多可加载
  let hasMore = $derived(pageNum <= totalPages);
  // 是否已全部加载完
  let finished = $derived(!loadingMore && !hasMore);

  async function refresh() {
    if (loading || !hasMore) {
      return;
    }
    loading = true;
    try {
      error = '';
      const { data, totalPages: total } = await communityWeb.getCommentsByTopic(
        oid,
        subjectType,
        sectionType,
        { page: pageNum, perPage: 20 },
      );

      if (total > 0) {
        totalPages = total;
      }

      if (pageNum === 1) {
        comments = data;
      } else {
        comments = comments.concat(...data);
      }

      // 返回空列表视为没有更多
      if (data.length === 0) {
        totalPages = pageNum - 1;
      }

      pageNum += 1;
    } catch (e) {
      error = String(e);
    }
    loading = false;
    loadingMore = false;
  }

  /** 以锚点评论为中心拉取上下文窗口，并自动展开锚点楼层、滚动定位到锚点评论 */
  async function loadContext(commentId: number) {
    loading = true;
    try {
      const ctx = await communityWeb.getCommentContext(oid, subjectType, sectionType, commentId);
      if (ctx.unavailableReason) {
        error = `评论不可用：${ctx.unavailableReason}`;
        return;
      }
      // 上下文模式不支持继续分页
      totalPages = 0;
      comments = ctx.floors;
      replyExpandTokens = { [ctx.anchor.floorId]: 1 };
      await tick();
      const targetId = ctx.anchor.reply ? commentId : ctx.anchor.floorId;
      const el = document.getElementById(`comment-id-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.animate(
          [
            {
              background: 'none',
            },
            {
              background: 'lightgreen',
            },
            {
              background: 'none',
            },
          ],
          400,
        );
      }
      // 锚点是回复时，回复列表异步拉取完成前元素尚不存在，延迟补一次定位
      if (ctx.anchor.reply) {
        setTimeout(() => {
          const anchor = document.getElementById(`comment-id-${commentId}`);
          if (!anchor) {
            return;
          }
          anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
          anchor.animate(
            [
              {
                background: 'none',
              },
              {
                background: 'lightgreen',
              },
              {
                background: 'none',
              },
            ],
            400,
          );
        }, 800);
      }
    } catch (e) {
      error = String(e);
    }
    loading = false;
  }

  $effect(() => {
    if (footer && observer) {
      observer.observe(footer);
    }
  });

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          loadingMore = true;
          refresh();
        }
      },
      {
        threshold: 0.1,
      },
    );
    // 主动加载第一页；有锚点评论时改为加载上下文窗口
    if (anchorCommentId != null) {
      loadContext(anchorCommentId);
    } else {
      refresh();
    }
  });
</script>

<WriteComment
  {oid}
  {subjectType}
  {sectionType}
  onNewComment={(c) => {
    comments = [c].concat(...comments);
  }}
/>
<div class="h-fit pl-2">
  {#if error}
    <div class="flex flex-col items-center justify-center gap-3 py-8">
      <p class="text-error text-sm">{error}</p>
      <button
        class="text-primary hover:text-primary-hover cursor-pointer text-sm transition-colors"
        onclick={() => {
          pageNum = 1;
          totalPages = Infinity;
          refresh();
        }}
      >
        重试
      </button>
    </div>
  {:else if loading && comments.length === 0}
    <div class="flex flex-col items-center justify-center gap-3 py-12">
      <div class="border-border border-t-primary size-8 animate-spin rounded-full border-2"></div>
      <span class="text-text-placeholder text-sm">加载评论中...</span>
    </div>
  {:else if comments.length === 0}
    <div class="flex flex-col items-center justify-center gap-3 py-12">
      <div class="bg-bg-secondary flex size-16 items-center justify-center rounded-full">
        <svg
          class="text-text-placeholder size-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <p class="text-text-placeholder text-sm">暂无评论，快来抢沙发</p>
    </div>
  {:else}
    <div class="divide-border divide-y">
      {#each comments as comment, i (comment.id)}
        <div class="hover:bg-bg-secondary/50 px-4 py-4 transition-colors">
          <CommentItem
            {comment}
            replyActive={replyTarget?.id === comment.id}
            onLike={(liked, likeCount) => {
              const nextComments = [...comments];
              nextComments[i] = { ...comment, liked, likeCount };
              comments = nextComments;
            }}
            onReply={() => {
              if (!$user.loggedIn) {
                toast.warning('请登录账号');
                return;
              }
              replyTarget =
                replyTarget?.id === comment.id
                  ? null
                  : {
                      id: comment.id,
                      topicId: comment.topicId,
                      name: comment.commenter.name,
                      replyCount: comment.replyCount ?? 0,
                    };
            }}
          >
            {#if replyTarget?.id === comment.id}
              <!-- 回复框复用 WriteComment，挂在整条评论下方（不能放进 .flex.gap-3，否则会与内容区争宽） -->
              <div class="mt-2 pl-13">
                <WriteComment
                  {oid}
                  {subjectType}
                  {sectionType}
                  {replyTarget}
                  onCancelReply={() => {
                    replyTarget = null;
                  }}
                  onReplied={() => {
                    // 回复成功后同步该评论的回复数，并让回复列表重新拉取并展开
                    const nextComments = [...comments];
                    nextComments[i] = {
                      ...comment,
                      replyCount: (comment.replyCount ?? 0) + 1,
                    };
                    comments = nextComments;
                    replyExpandTokens = {
                      ...replyExpandTokens,
                      [comment.id]: (replyExpandTokens[comment.id] ?? 0) + 1,
                    };
                  }}
                />
              </div>
            {/if}
            <div class="ml-13">
              <!-- 回复列表直接挂在每条评论下方，无需点击回复按钮即可查看 -->
              <ReplyList
                {oid}
                {subjectType}
                {sectionType}
                topicId={comment.topicId}
                parentId={comment.id}
                replyCount={comment.replyCount ?? 0}
                expandToken={replyExpandTokens[comment.id] ?? 0}
                onReplied={() => {
                  // 回复成功后同步该评论的回复数，并让回复列表重新拉取并展开
                  const nextComments = [...comments];
                  nextComments[i] = {
                    ...comment,
                    replyCount: (comment.replyCount ?? 0) + 1,
                  };
                  comments = nextComments;
                  replyExpandTokens = {
                    ...replyExpandTokens,
                    [comment.id]: (replyExpandTokens[comment.id] ?? 0) + 1,
                  };
                }}
              />
            </div>
          </CommentItem>
        </div>
      {/each}
    </div>

    <!-- 加载更多 footer -->
    {#if !finished}
      <footer
        bind:this={footer}
        class="text-text-placeholder flex w-full items-center justify-center gap-2 py-4 text-sm"
      >
        {#if loadingMore}
          <span class="border-border border-t-primary size-4 animate-spin rounded-full border-2"
          ></span>
          <span>加载中...</span>
        {:else}
          <span class="border-border size-4 rounded-full border-2"></span>
        {/if}
      </footer>
    {/if}
  {/if}
</div>
