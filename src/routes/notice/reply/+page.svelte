<script>
  import NotificationPage from '#lib/notify/NotificationPage.svelte';
</script>

<svelte:head>
  <title>回复通知 - Open CCW 消息中心 | 评论回复与讨论消息汇总</title>
  <meta
    name="description"
    content="在 Open CCW 消息中心查看 CCW 社区的回复通知，集中管理所有针对你发布的作品与评论的回复消息。登录后即可快速查阅、追踪每一条社区讨论，及时回应其他创作者与你之间的交流互动。"
  />
  <link rel="canonical" href="https://ccw.kivotos.qzz.io/notice/reply" />
</svelte:head>

<NotificationPage type="COMMENT_TO_ME"></NotificationPage>
