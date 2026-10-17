<script lang="ts">
  const { url }: { url: string } = $props();
  const Url = $derived(new URL(url));
</script>

<img
  src={url}
  alt="cover"
  class="hidden w-full object-cover md:block"
  style:transform="translate({Url.searchParams.get('x') || '0'}px, {Url.searchParams.get('y') ||
    '0'}px)"
/>

<img src={url} alt="cover" class="block min-h-72 min-w-full object-cover md:hidden" />
