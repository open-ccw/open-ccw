<script lang="ts">
  import type { PageProps } from "./$types";
  import Profile from "#lib/user/Profile.svelte";
  import PageHeader from "#lib/PageHeader.svelte";
  import { communityWeb } from "#lib/api";

  let { params }: PageProps = $props();

  let profile = $state<UserProfile | null>(null);
  let error = $state("");
  let loading = $state(false);
  let stats = $state<{
    likeCount: number;
    favoriteCount: number;
    followerCount: number;
    followingCount: number;
  } | null>(null);
  let lockDetail = $state({ locked: false, createdAt: -1, unlocksAt: -1 });

  async function load() {
    if (!params.id) {
      error = "config error";
      return;
    }
    lockDetail = { locked: false, createdAt: -1, unlocksAt: -1 };
    profile = null;
    loading = true;
    error = "";
    try {
      let studentNumber: string | undefined = undefined,
        studentOid: string | undefined = undefined;
      if (params.id.length == 24) {
        studentOid = params.id;
      } else {
        studentNumber = params.id;
      }

      profile = await communityWeb.getStudentProfile({
        studentNumber,
        studentOid,
      });
      const lockDetailResult = await communityWeb.getLockedUserDetail(
        profile.studentOid,
      );
      if (lockDetailResult.locked) {
        lockDetail = {
          locked: true,
          createdAt: lockDetailResult.createdAt,
          unlocksAt: lockDetailResult.unlocksAt,
        };
        loading = false;
        return;
      }

      const detail = await communityWeb.getCreationStudentDetail(
        profile.studentOid,
      );
      stats = {
        likeCount: detail.likeCount,
        favoriteCount: detail.favoriteCount,
        followerCount: detail.followerCount,
        followingCount: detail.followingCount,
      };
    } catch (e) {
      error = String(e);
    }
    loading = false;
  }

  $effect(() => {
    if (loading) {
      return;
    }
    if (!profile) {
      setTimeout(load, 10);
      return;
    }
    if (
      profile.studentNumber !== params.id &&
      profile.studentOid !== params.id
    ) {
      setTimeout(load, 10);
      return;
    }
  });
</script>

<svelte:head>
  <title>Open CCW - 用户主页 - {profile?.name ?? params.id}</title>
  <meta
    name="description"
    content={profile?.bio ?? "查看 CCW 用户的个人主页"}
  />
  <meta name="og:title" content="Open CCW - {profile?.name ?? '用户主页'}" />
  <meta
    name="og:description"
    content={profile?.bio ?? "查看 CCW 用户的个人主页"}
  />
  {#if profile?.avatar}
    <meta name="og:image" content={profile.avatar} />
  {/if}
  <meta name="og:url" content="https://ccw.kivotos.qzz.io/user/{params.id}" />
  <meta name="twitter:card" content="summary" />
  <meta
    name="twitter:title"
    content="Open CCW - {profile?.name ?? '用户主页'}"
  />
  <meta
    name="twitter:description"
    content={profile?.bio ?? "查看 CCW 用户的个人主页"}
  />
  {#if profile?.avatar}
    <meta name="twitter:image" content={profile.avatar} />
  {/if}
  <link rel="canonical" href="https://ccw.kivotos.qzz.io/user/{params.id}" />
</svelte:head>
<PageHeader></PageHeader>
<Profile {profile} {stats} {error} {loading} {lockDetail}></Profile>
