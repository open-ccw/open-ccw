<script lang="ts">
  import PageHeader from "#lib/PageHeader.svelte";
  const { children } = $props();
</script>

<PageHeader></PageHeader>
{@render children()}
