<div class="animate-pulse space-y-4">
  {#each [1, 2, 3] as _}
    <div class="bg-bg-secondary border-border rounded-xl border p-4 shadow">
      <div class="bg-bg-tertiary mb-3 h-4 w-1/3 rounded"></div>
      <div class="bg-bg-tertiary mb-2 h-4 w-full rounded"></div>
      <div class="bg-bg-tertiary h-4 w-2/3 rounded"></div>
    </div>
  {/each}
</div>
