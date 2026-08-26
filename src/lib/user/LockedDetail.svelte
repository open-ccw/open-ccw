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
    if (!ts || ts < 0) return "-";
    return new Date(ts).toLocaleString();
  }
</script>

<div class="max-w-full mx-auto flex justify-center py-12 md:py-20 px-4">
  <div
    class="bg-bg-secondary rounded-2xl shadow-lg border border-error px-6 py-8 max-w-md w-full text-center"
  >
    <div
      class="mx-auto size-16 rounded-full bg-error/10 flex items-center justify-center mb-4"
    >
      <svg
        class="size-8 text-error"
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
    <h2 class="text-xl font-bold text-text-primary">该用户已被封禁</h2>
    <p class="mt-2 text-sm text-text-secondary">
      该账号因违反ccw社区规范被封禁
    </p>
    <div class="mt-5 space-y-2 text-sm">
      <div class="flex items-center justify-between gap-2">
        <span class="text-text-placeholder">封禁时间</span>
        <span class="text-text-primary"
          >{formatLockTime(lockDetail.createdAt)}</span
        >
      </div>
      <div class="flex items-center justify-between gap-2">
        <span class="text-text-placeholder">解封时间</span>
        <span class="text-text-primary"
          >{formatLockTime(lockDetail.unlocksAt)}</span
        >
      </div>
      <div class="flex items-center justify-between gap-2">
        <span class="text-text-placeholder">最后登录</span>
        <span class="text-text-primary"
          >{formatLockTime(profile?.lastLoginAt ?? -1)}</span
        >
      </div>
    </div>
  </div>
</div>
