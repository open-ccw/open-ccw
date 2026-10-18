<script lang="ts">
  import AvatarImage from '#lib/user/AvatarImage.svelte';
  import { updateUser, user } from '#lib/user/userStore.ts';
  import { blur } from 'svelte/transition';
  import { toast } from '#lib';
  import { uploadFile } from '#lib/utils/storage.ts';
  import { communityWeb } from '@ccw-api/api';

  let openModal = $state(false);
  let selectedUrl = $state($user.loggedIn ? $user.avatar : '');
  let fileInput: HTMLInputElement | undefined = $state();
  let file: File | null = $state(null);
  let uploading = $state(false);

  /** 用户选择图片后更新预览，非图片文件给出提示 */
  function onFileChange() {
    if (!fileInput || !fileInput.files) {
      return;
    }
    file = fileInput.files[0];
    if (!file) {
      toast.error('请选择文件');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }
    selectedUrl = URL.createObjectURL(file);
    toast.success('图片已选择，等待上传');
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->

{#if $user.loggedIn}
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    class="hidden"
    onchange={() => requestAnimationFrame(onFileChange)}
  />
  <button
    class="group size-24 cursor-pointer overflow-hidden rounded-full"
    onclick={() => {
      openModal = true;
    }}
  >
    <AvatarImage url={$user.avatar}></AvatarImage>
    <div
      class="bg-bg/70 text-text-primary relative top-0 flex size-24 items-center justify-center transition-all group-hover:-top-24"
    >
      修改头像
    </div>
  </button>

  {#if openModal}
    <div
      class="fixed top-0 left-0 z-30 flex h-full w-full items-center justify-center bg-black/50"
      onclick={(e) => {
        if (e.currentTarget !== e.target) {
          return;
        }
        openModal = false;
      }}
      transition:blur={{ duration: 100 }}
      onkeydown={null}
    >
      <div class="bg-bg border-border flex w-64 flex-col rounded-lg border p-4 pt-2">
        <div class="text-text-primary border-border border-b pb-2 text-xl">修改头像</div>
        <div class="flex w-full justify-center">
          <div class="relative z-0 mt-2 flex w-48 flex-row justify-center">
            <img src={selectedUrl} alt="avatar" class="absolute z-0 size-full" />
            <div class="z-5 size-full bg-black/50">
              <img src={selectedUrl} alt="avatar" class="size-full rounded-full" />
            </div>
          </div>
        </div>
        <div class="text-text-secondary w-full text-center text-sm">预览</div>
        <div class="mt-2 flex w-full flex-col items-center gap-2">
          <button
            class="bg-border text-text-secondary hover:bg-primary hover:text-bg w-40 cursor-pointer rounded-lg p-2 transition-colors duration-100"
            onclick={() => {
              if (!fileInput) {
                toast.error('内部错误');
                return;
              }
              fileInput.value = '';
              fileInput.click();
            }}
          >
            选择图片
          </button>
          <button
            class="text-bg bg-primary hover:bg-primary-active disabled:bg-border disabled:text-text-placeholder disabled:hover:bg-border w-40 cursor-pointer rounded-lg p-2 transition-colors duration-100 disabled:cursor-not-allowed"
            disabled={!file || uploading}
            onclick={async () => {
              if (!file || uploading) {
                return;
              }
              uploading = true;
              try {
                const src = await uploadFile(file, 'WORK_COVER');
                const ok = await communityWeb.updateStudent({
                  avatar: src,
                });
                await updateUser();
                if (ok) {
                  toast.success('头像修改完成');
                } else {
                  throw '修改失败';
                }
              } catch (e) {
                toast.error(String(e));
              } finally {
                uploading = false;
              }
            }}
          >
            {uploading ? '上传中...' : '上传'}
          </button>
        </div>
      </div>
    </div>
  {/if}
{/if}
