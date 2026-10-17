<script lang="ts">
  import like from '#lib/assets/creationStat/like.svg';
  import view from '#lib/assets/creationStat/view.svg';
  import comments from '#lib/assets/creationStat/comments.svg';
  import { formatCount } from '#lib/search/format';
  import { goto } from '$app/navigation';
  import AvatarToProfile from '#lib/user/AvatarToProfile.svelte';
  type Props = {
    oid: string;
    cover: string;
    title: string;
    type: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    studentOid: string;
    studentName: string;
    studentAvatar: string;
    studentVirtual?: string | null;
  };
  const {
    oid,
    cover,
    title,
    type,
    viewCount,
    likeCount,
    commentCount,
    studentName,
    studentOid,
    studentAvatar,
    studentVirtual,
  }: Props = $props();
</script>

<div class="mt-2 w-48">
  <a
    href="/detail/{oid}"
    class="bg-bg-secondary border-border flex h-full flex-col items-center rounded-xl border p-2 shadow transition-all hover:border-indigo-400 hover:shadow-md"
  >
    {#if cover}
      <img
        src={cover}
        alt={title}
        class="border-border-strong aspect-video h-full rounded-lg border object-cover"
      />
    {/if}
    <div class="flex w-full flex-row items-center gap-1 self-start">
      {#if type == 'ORIGINAL'}
        <div
          class="border-success text-success scale-75 rounded-lg border pr-1 pl-1 text-sm text-nowrap"
        >
          原创
        </div>
      {:else}
        <div
          class="scale-75 rounded-lg border border-yellow-400 pr-1 pl-1 text-sm text-nowrap text-yellow-400"
        >
          改编
        </div>
      {/if}
      <div class="text-text-primary truncate font-medium">{title}</div>
    </div>

    <div class="flex w-full flex-row justify-center">
      <div class="text-text-secondary flex w-16 flex-row items-center gap-1">
        <img src={view} alt="view" class="size-4" />
        <span class="text-sm">{formatCount(viewCount)}</span>
      </div>
      <div class="text-text-secondary flex w-16 flex-row items-center gap-1">
        <img src={like} alt="like" class="size-4" />
        <span class="text-sm">{formatCount(likeCount)}</span>
      </div>
      <div class="text-text-secondary flex w-16 flex-row items-center gap-1">
        <img src={comments} alt="comments" class="size-4" />
        <span class="text-sm">{formatCount(commentCount)}</span>
      </div>
    </div>
    <div class="flex min-w-0 flex-1 flex-col gap-2 self-start">
      <div class="text-text-placeholder flex shrink-0 items-center gap-4 text-xs">
        <button
          class="flex h-8 cursor-pointer items-center overflow-hidden"
          onclick={(e) => {
            e.preventDefault();
            goto(`/user/${studentOid}`);
          }}
        >
          <div class="size-4 shrink-0">
            <AvatarToProfile oid={studentOid} url={studentAvatar} virtual={studentVirtual} />
          </div>
          {studentName}
        </button>
      </div>
    </div>
  </a>
</div>
