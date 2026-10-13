<script lang="ts">
  import Error from "#lib/utils/Error.svelte";
  import AvatarImage from "./AvatarImage.svelte";
  import ProfileBG from "./ProfileBG.svelte";
  import ProfileDataView from "./ProfileDataView.svelte";
  import AuthRankDisplay from "./AuthRankDisplay.svelte";
  import RenderHTML from "#lib/utils/RenderHTML.svelte";
  import ApprovalDisplay from "./ApprovalDisplay.svelte";
  import LockedDetail from "./LockedDetail.svelte";
  import ProfileSkeleton from "./ProfileSkeleton.svelte";
  import CommentTrigger from "#lib/comment/CommentTrigger.svelte";
  import { formatDate } from "#lib/search/format";

  let {
    profile = $bindable(null),
    stats = null,
    error = "",
    loading = false,
    lockDetail = { locked: false, createdAt: 0, unlocksAt: 0 },
  }: {
    profile: UserProfile | null;
    stats: {
      likeCount: number;
      favoriteCount: number;
      followerCount: number;
      followingCount: number;
    } | null;
    error: string;
    loading: boolean;
    lockDetail: { locked: boolean; createdAt: number; unlocksAt: number };
  } = $props();

  // 统计计数（缺省时为 0）
  let likeCount = $derived(stats?.likeCount ?? 0),
    favoriteCount = $derived(stats?.favoriteCount ?? 0),
    followerCount = $derived(stats?.followerCount ?? 0),
    followingCount = $derived(stats?.followingCount ?? 0);

  function formatBirthday(ts: number): string {
    if (!ts) return "-";
    const d = new Date(ts);
    return d.toLocaleDateString();
  }

  function genderLabel(g: string, hide: boolean): string {
    if (hide) return "保密";
    if (g === "MALE") return "男";
    if (g === "FEMALE") return "女";
    return g || "-";
  }
</script>

<Error {error}></Error>

{#if !loading}
  {#if lockDetail.locked}
    <LockedDetail {lockDetail} {profile}></LockedDetail>
  {:else if profile}
    <CommentTrigger
      oid={profile.studentOid}
      subjectType="PROFILE"
      sectionType="COMMENT"
    ></CommentTrigger>
    <div class="max-w-full mx-auto md:-mt-16 -mt-12">
      <div class="relative flex items-center w-full h-84 overflow-hidden">
        {#if profile.memberArchive?.homepageCover}
          <ProfileBG url={profile.memberArchive.homepageCover}></ProfileBG>
        {:else}
          <ProfileBG
            url={"https://static.xiguacity.cn/h1t86b7fg6c7k1qngo8i1hc1/static/media/mobile-bg.dc8c7967.png"}
          ></ProfileBG>
        {/if}
      </div>

      <div
        class="w-[90%] mx-auto -mt-16 relative z-10 bg-bg-secondary/50 backdrop-blur-[20px] shadow pt-5 rounded-3xl"
      >
        <div class="px-6 pb-6 flex-col">
          <!-- 头像 自我介绍 -->
          <div class="flex flex-row gap-4 relative flex-nowrap md:mt-0 -mt-2">
            <!-- 头像 -->
            <div class="size-16 md:size-32 shrink-0 md:-mt-12">
              {#if profile.avatar}
                <AvatarImage
                  url={profile.avatar}
                  virtual={profile.virtualValue}
                />
              {:else}
                <AvatarImage
                  url="https://m.xiguacity.cn/icon/new_avatar.png"
                  virtual={profile.virtualValue}
                />
              {/if}
            </div>

            <!-- 头像右侧基本信息 -->
            <div class="ml-2 mt-0 flex flex-col">
              <h1
                class="text-2xl font-bold text-black dark:text-white items-center gap-2 flex"
              >
                {profile.name}
                <AuthRankDisplay rank={profile.identityAuthRank}
                ></AuthRankDisplay>
                <div class="ml-4 text-sm text-text-secondary">
                  最后登录{new Date(profile.lastLoginAt).toLocaleString()}
                </div>
              </h1>
              <p class="text-xs text-text-primary mt-1">
                CCW ID：{profile.studentNumber}
              </p>
              <!-- 简介 -->
              {#if profile.bio}
                <p
                  class="mt-1 text-text-primary leading-relaxed text-sm text-balance break-all wrap-anywhere"
                >
                  {profile.bio}
                </p>
              {:else}
                <p class="mt-1 text-text-primary text-xs">
                  这个人很懒，什么都没写~
                </p>
              {/if}
              <div class="flex mt-2">
                <ApprovalDisplay
                  oid={profile.studentOid}
                  uid={profile.studentNumber}
                  enlarge
                ></ApprovalDisplay>
              </div>
            </div>
          </div>

          <!-- 核心统计 -->
          <div
            class="mt-6 grid grid-cols-4 gap-3 border-t border-white/10 pt-5 text-center"
          >
            <ProfileDataView
              name="信誉分"
              data={profile.reputationScore?.score ?? -1}
            />
            <ProfileDataView
              name="作品数"
              data={profile.statistics?.homeworkCount ?? -1}
            />
            <ProfileDataView name="总获赞" data={likeCount} />
            <ProfileDataView
              name="作品获赞"
              data={profile.statistics?.likeHomeworkCount ?? -1}
            />
          </div>

          <!-- 社交统计 -->
          <div
            class="mt-3 grid grid-cols-4 gap-3 border-t border-white/10 pt-4 text-center"
          >
            <ProfileDataView name="被收藏" data={favoriteCount} />
            <ProfileDataView name="评论数" data={profile.commentCount} />
            <ProfileDataView name="粉丝数" data={followerCount} />
            <ProfileDataView name="关注数" data={followingCount} />
          </div>
        </div>
      </div>

      <!-- 个人信息详情 -->
      <div
        class="w-[90%] mx-auto mt-4 bg-bg-secondary rounded-2xl shadow border border-white/10 px-6 py-5"
      >
        <h2 class="text-lg font-semibold text-black dark:text-white mb-4">
          个人信息
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div class="text-text-secondary">性别</div>
            <div class="text-text-primary mt-1" title={profile.gender}>
              {genderLabel(profile.gender, profile.hideGender)}
            </div>
          </div>
          <div>
            <div class="text-text-secondary">生日</div>
            <div
              class="text-text-primary mt-1"
              title={String(profile.birthday)}
            >
              {formatBirthday(profile.birthday)}
            </div>
          </div>
          <div>
            <div class="text-text-secondary">加入天数</div>
            <div class="text-text-primary mt-1">
              {profile.studentCreatedDays} 天
            </div>
          </div>
        </div>
      </div>

      <!-- 个人简介详情 -->
      <div
        class="w-[90%] mx-auto mt-4 bg-bg-secondary rounded-2xl shadow border border-white/10 px-6 py-5"
      >
        <h2 class="text-lg font-semibold text-black dark:text-white mb-4">
          个人介绍
        </h2>
        {#if profile.extraInfo}
          <div class="space-y-4 text-sm">
            {#if profile.extraInfo.learnedProgrammingLanguages}
              <div>
                <div class="text-text-primary">掌握语言</div>
                <div class="flex flex-wrap gap-2 mt-2">
                  {#each profile.extraInfo.learnedProgrammingLanguages.split(/[,，]/) as lang}
                    {#if lang.trim()}
                      <span
                        class="px-2.5 py-1 bg-indigo-500/20 text-text-primary/80 rounded-full text-xs"
                        >{lang.trim()}</span
                      >
                    {/if}
                  {/each}
                </div>
              </div>
            {/if}
            {#if profile.extraInfo.hobbies}
              <div>
                <div class="text-text-primary">兴趣爱好</div>
                <div class="flex flex-wrap gap-2 mt-2">
                  {#each profile.extraInfo.hobbies.split(/[,，]/) as hobby}
                    {#if hobby.trim()}
                      <span
                        class="px-2.5 py-1 bg-purple-500/20 text-text-primary/80 rounded-full text-xs"
                        >{hobby.trim()}</span
                      >
                    {/if}
                  {/each}
                </div>
              </div>
            {/if}
            {#if profile.extraInfo.selfIntroduction}
              <span class="text-text-primary">自我介绍</span>
              <RenderHTML text={profile.extraInfo.selfIntroduction}
              ></RenderHTML>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  {/if}
{:else if error}
  <div class="max-w-full mx-auto py-12 text-center">
    <p class="text-text-placeholder">加载失败，请稍后重试</p>
  </div>
{:else}
  <ProfileSkeleton></ProfileSkeleton>
{/if}
