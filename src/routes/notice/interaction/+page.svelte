<script>
  import NotificationPage from '#lib/notify/NotificationPage.svelte';
</script>

<svelte:head>
  <title>内容互动通知 - Open CCW 消息中心 | 点赞、评论等作品互动动态一览</title>
  <meta
    name="description"
    content="在 Open CCW 消息中心查看 CCW 社区作品的内容互动通知，汇总所有点赞、收藏、评论等互动动态。登录后即可实时掌握你的作品在社区中收到的每一次反馈，不错过任何一条互动消息。"
  />
  <link rel="canonical" href="https://ccw.kivotos.qzz.io/notice/interaction" />
</svelte:head>

<NotificationPage type="CREATION_INTERACTION"></NotificationPage>
