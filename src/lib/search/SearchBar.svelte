<script lang="ts">
  let {
    value = $bindable(''),
    onsearch,
  }: {
    value: string;
    onsearch: () => void;
  } = $props();

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    onsearch();
  }
</script>

<form onsubmit={handleSubmit}>
  <div class="relative">
    <span class="text-text-placeholder absolute top-1/2 left-4 -translate-y-1/2">
      <svg
        class="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </span>
    <input
      type="text"
      placeholder="搜索作品、用户、文章、星球..."
      bind:value
      class="bg-bg-secondary border-border text-text-primary placeholder-text-placeholder focus:border-primary h-12 w-full rounded-full border pr-4 pl-12 shadow-sm transition-all outline-none"
    />
    <button
      type="submit"
      class="bg-primary hover:bg-primary-hover absolute top-1/2 right-1.5 h-9 -translate-y-1/2 cursor-pointer rounded-full px-5 text-sm font-medium text-white transition-all active:scale-95"
    >
      搜索
    </button>
  </div>
</form>
