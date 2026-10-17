<script lang="ts">
  const {
    url = 'https://m.xiguacity.cn/icon/new_avatar.png',
    alt = 'avatar',
    virtual = null,
  } = $props();
</script>

<div class="relative flex size-full items-center justify-center select-none">
  {#if virtual}
    <img
      src={virtual}
      alt={virtual}
      class="absolute z-10 scale-150 select-none"
      draggable={false}
    />
  {/if}
  <img
    src={url ?? 'https://m.ccw.site/community/images/avatar-default.png'}
    {alt}
    draggable={false}
    class="border-border z-0 m-auto size-full rounded-full border select-none"
  />
</div>
