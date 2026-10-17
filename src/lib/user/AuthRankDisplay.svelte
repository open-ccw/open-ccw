<script lang="ts">
  let { rank = 'L0' } = $props();
  let rankNum = $derived(parseInt((rank ?? 'L0').at(-1)!));
  let url = $derived.by(() => {
    if (isNaN(rankNum) || rankNum < 0 || rankNum > 2) {
      return 'https://m.ccw.site/community/icons/Id_Auth_Rank_L0.png';
    } else {
      return `https://m.ccw.site/community/icons/Id_Auth_Rank_L${rankNum}.png`;
    }
  });
</script>

<img src={url} alt={String(rankNum)} class="h-6" />
