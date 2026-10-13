<script lang="ts">
  import AvatarToProfile from "#lib/user/AvatarToProfile.svelte";
  import { user } from "#lib/user/userStore";
  import { getOSS } from "#lib/utils/oss";
  import { communityWeb } from "@ccw-api/api";
  import { toast } from "#lib/toast";
  import type OSS from "ali-oss";
  import CryptoJS from "crypto-js";
  import type { MinimalComment, TopicConfig } from "./types";

  let comment = $state("");
  let textArea: HTMLTextAreaElement | undefined = $state();
  let oss: OSS | undefined = $state();
  let submitting = $state(false);
  let error = $state("");
  let {
    oid,
    subjectType,
    sectionType,
    onNewComment,
  }: TopicConfig & {
    onNewComment(c: MinimalComment): void;
  } = $props();

  function handlePaste(clipboardData: DataTransfer) {
    const item = Array.from(clipboardData.items).at(-1);
    if (!item) {
      return;
    }
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (!file) {
        return;
      }
      handleImg(file);
      return;
    }
  }

  async function handleImg(img: File) {
    if (!oss || !$user.loggedIn) {
      console.error("未登录,无法上传");
      return;
    }
    const wa = CryptoJS.lib.WordArray.create(await img.arrayBuffer());
    const id = CryptoJS.MD5(wa);
    const type = img.name.split(".").at(-1);
    const pattern = `![${img.name}](UPLOADING_${id}.${type})`;
    const path = `works-covers/${$user.studentNumber}/${id}.${type}`;
    if (textArea) {
      const start = textArea.selectionStart;
      comment =
        comment.substring(0, start) + pattern + comment.substring(start);
    }
    const url = `https://m.ccw.site/${path}?t=.png`;
    upload(img, path)
      .then(() => {
        comment = comment.replaceAll(pattern, `![${img.name}](${url})`);
      })
      .catch((e) => {
        console.warn(e);
        comment = comment.replaceAll(
          pattern,
          `![${img.name}(可能上传失败)](${url})`,
        );
      });
  }

  async function upload(img: File, url: string) {
    if (!oss || !$user.loggedIn) {
      console.error("未登录,无法上传");
      return;
    }
    return oss.put(url, img, {
      headers: {
        "x-oss-forbid-overwrite": true,
      },
    });
  }

  async function init() {
    if (!$user.loggedIn) {
      return;
    }
    oss = await getOSS($user.oid);
  }

  $effect(() => {
    if ($user.loggedIn) {
      setTimeout(init, 10);
    }
  });

  async function createComment() {
    if (submitting || !$user.loggedIn) {
      return;
    }
    if (!comment.trim()) {
      toast.error("评论内容不能为空");
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
      comment = "";
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
      onNewComment(patchedNewComment);
    } catch (e) {
      error = String(e);
    }
    submitting = false;
  }
</script>

{#if $user.loggedIn}
  {#if error}
    <div class="text-error border border-error">{error}</div>
  {/if}
  <div class="mt-4 flex flex-row gap-4 md:gap-8 w-full p-2">
    <div class="size-8 md:size-12 translate-x-1.5 translate-y-1 shrink-0">
      <AvatarToProfile
        oid={$user.oid}
        url={$user.avatar}
        virtual={$user.virtualValue}
      />
    </div>
    <form class="flex-1">
      <div class="input-group w-auto">
        <textarea
          class="input"
          name="comment"
          placeholder="评论(可粘贴图片文件)"
          bind:value={comment}
          bind:this={textArea}
          onpaste={(e) => {
            if (!e.clipboardData) {
              return;
            }
            const { clipboardData } = e;
            handlePaste(clipboardData);
          }}
        >
        </textarea>
        <button
          class="button--submit {submitting
            ? 'cursor-not-allowed'
            : 'cursor-pointer'}"
          disabled={submitting}
          onclick={createComment}>评论</button
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
