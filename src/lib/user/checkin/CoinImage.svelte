<script lang="ts">
  import common from "#lib/assets/common-gold.svg";
  import more from "#lib/assets/more-gold.svg";
  const { bucks = 0 } = $props();
  let src = $derived.by(() => {
    switch (bucks) {
      case 2:
        return common;
      case 10:
        return more;
      case 40:
        return more;
      default:
        return common;
    }
  });
</script>

<img {src} alt="+{bucks}" class="w-full h-full" />
