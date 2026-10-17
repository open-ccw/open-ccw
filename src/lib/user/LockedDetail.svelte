<script lang="ts">
  let {
    lockDetail = { locked: false, createdAt: 0, unlocksAt: 0 },
    profile,
  }: {
    lockDetail: { locked: boolean; createdAt: number; unlocksAt: number };
    profile: UserProfile | null;
  } = $props();

  // 封禁时间格式化
  function formatLockTime(ts: number): string {
    if (!ts || ts < 0) return '-';
    return new Date(ts).toLocaleString();
  }
</script>

<div class="mx-auto flex max-w-full justify-center px-4 py-12 md:py-20">
  <div
    class="bg-bg-secondary border-error w-full max-w-md rounded-2xl border px-6 py-8 text-center shadow-lg"
  >
    <div class="bg-error/10 mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
      <svg
        class="text-error size-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    </div>
    <h2 class="text-text-primary text-xl font-bold">该用户已被封禁</h2>
    <p class="text-text-secondary mt-2 text-sm">该账号因违反ccw社区规范被封禁</p>
    <div class="mt-5 space-y-2 text-sm">
      <div class="flex items-center justify-between gap-2">
        <span class="text-text-placeholder">封禁时间</span>
        <span class="text-text-primary">{formatLockTime(lockDetail.createdAt)}</span>
      </div>
      <div class="flex items-center justify-between gap-2">
        <span class="text-text-placeholder">解封时间</span>
        <span class="text-text-primary">{formatLockTime(lockDetail.unlocksAt)}</span>
      </div>
      <div class="flex items-center justify-between gap-2">
        <span class="text-text-placeholder">最后登录</span>
        <span class="text-text-primary">{formatLockTime(profile?.lastLoginAt ?? -1)}</span>
      </div>
    </div>
  </div>
</div>
