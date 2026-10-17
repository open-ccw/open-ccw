<script lang="ts">
  import type { Creation } from '@ccw-api/api';
  import { formatCount, formatCover } from './format';
  import like from '#lib/assets/creationStat/like.svg';
  import view from '#lib/assets/creationStat/view.svg';
  import comments from '#lib/assets/creationStat/comments.svg';
  import AvatarToProfile from '#lib/user/AvatarToProfile.svelte';
  import { goto } from '$app/navigation';
  import ProjectDetailSM from '#lib/project/ProjectDetailSM.svelte';

  let { item }: { item: Creation.Creation } = $props();

  const cover = $derived(formatCover(item));
  const title = $derived(item.title.replaceAll('<em>', '').replaceAll('</em>', ''));
</script>

<ProjectDetailSM
  oid={item.oid}
  {cover}
  {title}
  viewCount={item.viewCount}
  likeCount={item.likeCount}
  commentCount={item.commentCount}
  studentOid={item.studentOid}
  studentName={item.student.name}
  studentAvatar={item.student.avatar}
  studentVirtual={item.student.virtualValue}
  type={item.type}
></ProjectDetailSM>
