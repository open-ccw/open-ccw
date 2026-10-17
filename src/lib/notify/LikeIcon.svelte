<script lang="ts">
  import smile from '#lib/assets/like_icon/smile.svg';
  import six from '#lib/assets/like_icon/six.svg';
  import handshake from '#lib/assets/like_icon/handshake.svg';
  import heart from '#lib/assets/like_icon/heart.svg';
  import like from '#lib/assets/like_icon/like.svg';
  import watermelon from '#lib/assets/like_icon/watermelon.svg';
  import flower from '#lib/assets/like_icon/flower.svg';
  const { like_icon = smile } = $props();
  let icon = $derived.by(() => {
    switch (like_icon) {
      case 'https://m.xiguacity.cn/static/homework/smile.png':
        return smile;
      case 'https://m.xiguacity.cn/static/homework/six.png':
        return six;
      case 'https://m.xiguacity.cn/static/homework/handshake.png':
        return handshake;
      case 'https://m.xiguacity.cn/static/homework/heart.png':
        return heart;
      case 'https://m.xiguacity.cn/static/homework/like.png':
        return like;
      case 'https://m.xiguacity.cn/static/homework/watermelon.png':
        return watermelon;
      case 'https://m.xiguacity.cn/static/homework/flowers.png':
        return flower;
      default:
        return like_icon;
    }
  });
</script>

<img class="inline size-6" src={icon} alt="like_icon" />
