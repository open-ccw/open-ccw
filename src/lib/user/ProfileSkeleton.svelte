<!-- 加载骨架屏 -->
<div class="mx-auto -mt-12 max-w-full animate-pulse md:-mt-16">
  <div class="bg-bg-tertiary h-72 w-full rounded"></div>
  <div class="bg-bg-secondary border-border border shadow">
    <div class="px-6 py-6">
      <div class="flex flex-row items-center gap-4">
        <div class="bg-bg-tertiary size-16 shrink-0 rounded-full"></div>
        <div class="flex-1 space-y-2">
          <div class="bg-bg-tertiary h-6 w-1/3 rounded"></div>
          <div class="bg-bg-tertiary h-4 w-1/4 rounded"></div>
        </div>
      </div>
      <div class="border-border mt-6 grid grid-cols-4 gap-3 border-t pt-5">
        {#each { length: 4 } as _}
          <div class="space-y-2 text-center">
            <div class="bg-bg-tertiary mx-auto h-6 w-3/4 rounded"></div>
            <div class="bg-bg-tertiary mx-auto h-3 w-1/2 rounded"></div>
          </div>
        {/each}
      </div>
    </div>
  </div>
  <div class="bg-bg-secondary border-border mt-4 space-y-3 rounded-2xl border px-6 py-5 shadow">
    <div class="bg-bg-tertiary h-5 w-1/4 rounded"></div>
    <div class="bg-bg-tertiary h-4 w-full rounded"></div>
    <div class="bg-bg-tertiary h-4 w-2/3 rounded"></div>
  </div>
</div>
