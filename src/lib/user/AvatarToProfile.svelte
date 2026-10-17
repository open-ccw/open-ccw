<script lang="ts">
  import AvatarImage from './AvatarImage.svelte';

  const { url, alt = 'avatar', virtual = null, oid } = $props();
</script>

<a href="/user/{oid}" class="cursor-pointer">
  <AvatarImage {url} {alt} {virtual}></AvatarImage>
</a>
