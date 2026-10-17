<script lang="ts">
  import { communityWeb } from '@ccw-api/api';
  import { onMount } from 'svelte';
  import type { MinimalComment, TopicConfig } from './types';
  import AvatarToProfile from '#lib/user/AvatarToProfile.svelte';
  import RenderComment from './RenderComment.svelte';
  import ApprovalDisplay from '#lib/user/ApprovalDisplay.svelte';
  import { toast } from '#lib';
  import { user } from '#lib/user/userStore.ts';
  import WriteComment from './WriteComment.svelte';
  import up from '#lib/assets/arrow-up-from-line.svg?raw';

  const { oid, subjectType, sectionType }: TopicConfig = $props();
  let pageNum = $state(1);
  let totalPages = $state(Infinity);
  let loading = $state(false);
  let loadingMore = $state(false);
  let comments: MinimalComment[] = $state.raw([]);
  let footer: HTMLElement | null = $state(null);
  let observer: null | IntersectionObserver = $state(null);
  let error = $state('');

  // 是否还有更多可加载
  let hasMore = $derived(pageNum <= totalPages);
  // 是否已全部加载完
  let finished = $derived(!loadingMore && !hasMore);

  function formatTime(date: number): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }

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
    // 主动加载第一页
    refresh();
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
          <div class="flex gap-3">
            <!-- 头像 -->
            <div class="size-10 shrink-0">
              <AvatarToProfile
                oid={comment.commenter.accountOid}
                url={comment.commenter.avatar}
                virtual={comment.commenter.virtualValue}
              ></AvatarToProfile>
            </div>

            <!-- 内容区 -->
            <div class="min-w-0 flex-1">
              <div class="mb-1 flex">
                <!-- 用户信息和勋章 -->
                <div class="flex gap-2">
                  <a
                    href="/user/{comment.commenter.accountOid}"
                    class="text-text-secondary hover:text-primary shrink-0 text-base font-semibold transition-colors"
                  >
                    {comment.commenter.name}
                  </a>
                  <ApprovalDisplay
                    approvals={comment.commenter.approvalTagRelations}
                    oid={comment.commenter.accountOid}
                    showHidden={false}
                  ></ApprovalDisplay>
                </div>
                {#if comment.weight}
                  <div class="text-star size-6" aria-label="该评论被置顶" title="该评论被置顶">
                    {@html up}
                  </div>
                {/if}
              </div>

              <!-- 评论内容 -->
              <div class="text-text-secondary mb-2 text-sm leading-relaxed">
                <RenderComment comment={comment.content}></RenderComment>
              </div>

              <!-- 时间和操作栏 -->
              <div class="flex items-center justify-between gap-4">
                {#if comment.createdAt}
                  <span class="text-text-placeholder text-xs">{formatTime(comment.createdAt)}</span>
                {/if}

                <!-- 操作栏 -->
                <div class="flex items-center gap-4">
                  <button
                    class="text-text-placeholder hover:text-primary flex cursor-pointer items-center gap-1 text-xs transition-colors"
                    onclick={async () => {
                      if (!$user.loggedIn) {
                        toast.warning('请登录账号');
                        return;
                      }
                    }}
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
                    <span>回复{comment.replyCount}</span>
                  </button>
                  <button
                    class="text-text-placeholder hover:text-error flex cursor-pointer items-center gap-1 text-xs transition-colors"
                    onclick={async () => {
                      if (!$user.loggedIn) {
                        toast.warning('请登录账号');
                        return;
                      }
                      let success = false;
                      if (comment.liked) {
                        success = await communityWeb.unlikeComment(comment.id);
                      } else {
                        success = await communityWeb.likeComment(comment.id);
                      }
                      if (success) {
                        let newComments = [...comments];
                        newComments[i] = {
                          ...comment,
                          likeCount: comment.likeCount + (comment.liked ? -1 : 1),
                          liked: !comment.liked,
                        };
                        comments = newComments;
                      }
                    }}
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
