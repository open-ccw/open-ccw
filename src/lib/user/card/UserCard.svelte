<script lang="ts">
  import { communityWeb } from '#lib/api';
  import { onMount } from 'svelte';
  import AvatarImage from '../AvatarImage.svelte';

  /** 无代表作时的封面兜底图 */
  const DEFAULT_COVER =
    'https://m.ccw.site/community/images/creation-default.png?x-oss-process=image%2Fresize%2Cs_360%2Fformat%2Cwebp&imageView2/3/w/360/h/360%7CimageMogr2/format/webp';

  let { oid }: { oid: string } = $props();

  type CardData = Awaited<ReturnType<typeof communityWeb.getUserCardDetail>>;

  let data = $state<CardData | null>(null);
  let failed = $state(false);

  onMount(async () => {
    try {
      data = await communityWeb.getUserCardDetail(oid);
    } catch {
      failed = true;
    }
  });

  const cover = $derived(
    data?.creation?.featuredCoverLink || data?.creation?.latestCoverLink || DEFAULT_COVER,
  );
  const stats = $derived(data?.user.statistics);
  const badges = $derived(data?.user.approvalTags ?? []);
</script>

{#if failed}
  <div class="bg-bg border-border w-72 rounded-lg border p-3 text-sm shadow-md">加载失败</div>
{:else if !data}
  <div class="bg-bg border-border h-36 w-72 animate-pulse rounded-lg border shadow-md"></div>
{:else}
  <div class="bg-bg border-border w-72 overflow-hidden rounded-lg border shadow-md">
    <!-- 上半背景：代表作封面，无代表作时用兜底图 -->
    <div class="bg-bg-secondary relative h-20">
      <img src={cover} alt="代表作封面" class="size-full object-cover" draggable={false} />
    </div>
    <!-- 下半纯色区，头像压在上下分界线上 -->
    <div class="relative px-3 pb-3">
      <div class="absolute top-0 left-2 size-12 -translate-y-1/2">
        <AvatarImage url={data.user.avatar} virtual={data.user.virtualValue} alt={data.user.name} />
      </div>

      <div class="min-w-0 pl-14">
        <div class="mb-2 flex flex-row gap-2">
          <div class="text-text-primary truncate text-sm font-medium">{data.user.name}</div>
          {#if badges.length > 0}
            <div class="flex flex-wrap gap-1">
              {#each badges as tag (tag.id)}
                {#if tag.adorned}
                  <!-- adorned 的勋章使用小图, 防止错位 -->
                  <img
                    src={tag.approvalTag.mediumImage}
                    alt={tag.approvalTagName}
                    title={tag.approvalTagName}
                    class="h-5"
                    draggable={false}
                  />
                {/if}
              {/each}
            </div>
          {/if}
        </div>

        {#if data.user.bio}
          <div class="text-text-secondary truncate text-xs">{data.user.bio}</div>
        {/if}
      </div>

      {#if stats}
        <div class="text-text-secondary mt-2 flex gap-4 text-xs">
          <span>关注 <span class="text-text-primary font-medium">{stats.followingCount}</span></span
          >
          <span>粉丝 <span class="text-text-primary font-medium">{stats.followerCount}</span></span>
        </div>
      {/if}
    </div>
  </div>
{/if}
