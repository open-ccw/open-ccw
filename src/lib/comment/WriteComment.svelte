<script lang="ts">
  import AvatarToProfile from '#lib/user/AvatarToProfile.svelte';
  import { user } from '#lib/user/userStore.ts';
  import { fileMd5, uploadFile } from '#lib/utils/storage.ts';
  import { communityWeb } from '@ccw-api/api';
  import { toast } from '#lib/toast.ts';
  import type { MinimalComment, ReplyTarget, TopicConfig } from './types';

  let comment = $state('');
  let textArea: HTMLTextAreaElement | undefined = $state();
  let submitting = $state(false);
  let error = $state('');
  let {
    oid,
    subjectType,
    sectionType,
    replyTarget = null,
    onNewComment,
    onCancelReply,
    onReplied,
  }: TopicConfig & {
    /** 回复目标，非空时输入框进入回复模式 */
    replyTarget?: ReplyTarget | null;
    /** 新评论创建成功后的回调（顶部评论框使用，回复框暂不需要） */
    onNewComment?(c: MinimalComment): void;
    /** 取消回复 */
    onCancelReply?(): void;
    /** 回复发送成功后的回调，用于让父组件同步回复计数 */
    onReplied?(): void;
  } = $props();

  // 进入回复模式后聚焦输入框，避免用户还要手动点一次
  $effect(() => {
    if (replyTarget) {
      textArea?.focus();
    }
  });

  function handlePaste(clipboardData: DataTransfer) {
    const item = Array.from(clipboardData.items).at(-1);
    if (!item) {
      return;
    }
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (!file) {
        return;
      }
      handleImg(file);
      return;
    }
  }

  async function handleImg(img: File) {
    if (!$user.loggedIn) {
      console.error('未登录,无法上传');
      return;
    }
    const id = await fileMd5(img);
    const type = img.name.split('.').at(-1);
    const pattern = `![${img.name}](UPLOADING_${id}.${type})`;
    if (textArea) {
      const start = textArea.selectionStart;
      comment = comment.substring(0, start) + pattern + comment.substring(start);
    }
    uploadFile(img, 'WORK_COVER')
      .then((url) => {
        comment = comment.replaceAll(pattern, `![${img.name}](${url}?t=.png)`);
      })
      .catch((e) => {
        console.warn(e);
        const url = `https://m.ccw.site/works-covers/${$user.studentNumber}/${id}.${type}?t=.png`;
        comment = comment.replaceAll(pattern, `![${img.name}(可能上传失败)](${url})`);
      });
  }

  async function submit() {
    if (submitting || !$user.loggedIn) {
      return;
    }
    if (!comment.trim()) {
      toast.error('评论内容不能为空');
      return;
    }
    if (replyTarget) {
      submitting = true;
      try {
        await communityWeb.replyComment(comment, replyTarget.id);
        comment = '';
        onReplied?.();
      } catch (e) {
        error = String(e);
      }
      submitting = false;
      return;
    }
    submitting = true;
    try {
      const newComment = await communityWeb.createComment(
        comment,
        {
          subjectOid: oid,
          subjectType,
        },
        sectionType,
      );
      comment = '';
      const patchedNewComment: MinimalComment = {
        ...newComment,
        likeCount: 0,
        replyCount: 0,
        commenter: {
          accountOid: $user.oid,
          avatar: $user.avatar,
          name: $user.name,
          virtualValue: $user.virtualValue,
          approvalTagRelations: null,
        },
      };
      onNewComment?.(patchedNewComment);
    } catch (e) {
      error = String(e);
    }
    submitting = false;
  }
</script>

{#if $user.loggedIn}
  {#if error}
    <div class="text-error border-error border">{error}</div>
  {/if}
  <div class="mt-4 flex w-full flex-row gap-4 p-2 md:gap-8">
    {#if !replyTarget}
      <!-- 回复模式下省略自己的头像，把宽度让给输入框 -->
      <div class="size-8 shrink-0 translate-x-1.5 translate-y-1 md:size-12">
        <AvatarToProfile oid={$user.oid} url={$user.avatar} virtual={$user.virtualValue} />
      </div>
    {/if}
    <form class="flex-1">
      {#if replyTarget}
        <div class="text-text-secondary mb-1 flex items-center gap-2 text-xs">
          <span class="truncate">
            回复 <span class="text-primary">{replyTarget.name}</span>
          </span>
          <button
            type="button"
            class="text-text-placeholder hover:text-error shrink-0 cursor-pointer transition-colors duration-100"
            onclick={onCancelReply}>取消</button
          >
        </div>
      {/if}
      <div class="input-group w-auto">
        <textarea
          class="input"
          name="comment"
          placeholder={replyTarget ? `回复 ${replyTarget.name}` : '评论(可粘贴图片文件)'}
          bind:value={comment}
          bind:this={textArea}
          onpaste={(e) => {
            if (!e.clipboardData) {
              return;
            }
            const { clipboardData } = e;
            handlePaste(clipboardData);
          }}></textarea>
        <button
          class="button--submit {submitting ? 'cursor-not-allowed' : 'cursor-pointer'}"
          disabled={submitting}
          onclick={submit}>{replyTarget ? '回复' : '评论'}</button
        >
      </div>
    </form>
  </div>
{/if}

<style>
  .input-group {
    display: flex;
    align-items: stretch;
  }

  .input {
    flex: 1;
    min-height: 72px;
    max-height: 16rem;
    padding: 0.5rem 1rem;
    color: var(--color-text-primary);
    font-size: 15px;
    line-height: 1.5;
    border: 1px solid var(--color-primary);
    border-radius: 10px 0 0 10px;
    background-color: transparent;
    outline: none;
    resize: none;
    overflow-y: auto;
  }

  .input::placeholder {
    color: var(--color-text-placeholder);
  }

  .button--submit {
    min-height: 64px;
    padding: 0.5em 0.75em;
    border: 1px solid var(--color-primary);
    border-left: none;
    border-radius: 0 10px 10px 0;
    background-color: transparent;
    color: var(--color-primary);
    font-size: 15px;
    cursor: pointer;
    transition:
      background-color 0.15s ease-in-out,
      color 0.15s ease-in-out;
  }

  .button--submit:hover {
    background-color: var(--color-primary);
    color: #fff;
  }

  .button--submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .input:focus,
  .input:focus-visible {
    border-color: var(--color-primary-active);
    outline: none;
  }
</style>
