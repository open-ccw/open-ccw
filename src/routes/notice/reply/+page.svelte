<script>
  import NotificationPage from "#lib/notify/NotificationPage.svelte";
</script>

<svelte:head>
  <meta
    name="description"
    content="查看 CCW 社区的回复通知，包括评论回复等动态。Open CCW 消息中心 - 回复通知页面。"
  />
  <link rel="canonical" href="https://ccw.kivotos.qzz.io/notice/reply" />
</svelte:head>

<NotificationPage type="COMMENT_TO_ME"></NotificationPage>
