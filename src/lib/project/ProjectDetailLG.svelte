<script lang="ts">
  // 这个不对
  import like from "#lib/assets/creationStat/like.svg";
  import view from "#lib/assets/creationStat/view.svg";
  import comments from "#lib/assets/creationStat/comments.svg";
  import { formatCount } from "#lib/search/format";
  import { goto } from "$app/navigation";
  import AvatarToProfile from "#lib/user/AvatarToProfile.svelte";
  type Props = {
    oid: string;
    cover: string;
    title: string;
    type: "ORIGINAL" | "REMIXED";
    viewCount: number;
    likeCount: number;
    commentCount: number;
    studentOid: string;
    studentName: string;
    studentAvatar: string;
    studentVirtual?: string;
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

<div class="w-48 mt-2">
  <a
    href="/detail/{oid}"
    class="h-full flex flex-col items-center bg-white rounded-xl shadow border border-border p-2 hover:border-indigo-200 hover:shadow-md transition-all"
  >
    {#if cover}
      <img
        src={cover}
        alt={title}
        class="h-full aspect-video rounded-lg object-cover border border-border-strong"
      />
    {/if}
    <div class="flex flex-row gap-1 self-start items-center w-full">
      {#if type == "ORIGINAL"}
        <div
          class="text-nowrap border-success text-success border rounded-lg pl-1 pr-1 text-sm scale-75"
        >
          原创
        </div>
      {:else}
        <div
          class="text-nowrap border-yellow-700 text-yellow-700 border rounded-lg pl-1 pr-1 text-sm scale-75"
        >
          改编
        </div>
      {/if}
      <div class="font-medium text-text-primary truncate">{title}</div>
    </div>

    <div class="flex flex-row justify-center w-full">
      <div class="flex flex-row w-16 items-center gap-1">
        <img src={view} alt="view" class="size-4" />
        <span class="text-sm">{formatCount(viewCount)}</span>
      </div>
      <div class="flex flex-row w-16 items-center gap-1">
        <img src={like} alt="like" class="size-4" />
        <span class="text-sm">{formatCount(likeCount)}</span>
      </div>
      <div class="flex flex-row w-16 items-center gap-1">
        <img src={comments} alt="comments" class="size-4" />
        <span class="text-sm">{formatCount(commentCount)}</span>
      </div>
    </div>
    <div class="min-w-0 flex-1 gap-2 flex flex-col self-start">
      <div
        class="flex gap-4 text-xs text-text-placeholder shrink-0 items-center"
      >
        <button
          class="h-8 flex cursor-pointer overflow-hidden items-center"
          onclick={(e) => {
            e.preventDefault();
            goto(`/user/${studentOid}`);
          }}
        >
          <div class="shrink-0 size-4">
            <AvatarToProfile
              oid={studentOid}
              url={studentAvatar}
              virtual={studentVirtual}
            />
          </div>
          {studentName}
        </button>
      </div>
    </div>
  </a>
</div>
