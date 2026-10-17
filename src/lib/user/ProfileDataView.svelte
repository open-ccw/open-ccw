<script lang="ts">
  const { name = 'name', data = 'data' }: { name: string; data: number | string } = $props();
</script>

<div>
  <div class="text-text-primary text-2xl font-bold dark:text-white">
    {data}
  </div>
  <div class="text-text-secondary mt-1 text-xs">{name}</div>
</div>
