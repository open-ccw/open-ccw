<script lang="ts">
  import Header from "#lib/PageHeader.svelte";
  import logo from "#lib/assets/favicon.svg";
  import coinSvg from "#lib/assets/coin.svg";
  import noticeSvg from "#lib/assets/notice.svg";
  import cogSvg from "#lib/assets/cog.svg";

  const features = [
    {
      icon: coinSvg,
      title: "每日签到",
      desc: "登录后一键签到，领取金币奖励",
    },
    {
      icon: noticeSvg,
      title: "消息通知",
      desc: "聚合互动与回复消息，不错过任何动态",
    },
    {
      icon: cogSvg,
      title: "设备管理",
      desc: "查看登录会话，随时退出可疑设备",
    },
  ];
</script>

<svelte:head>
  <title>Open CCW-第三方 CCW 启动器</title>
  <meta
    name="description"
    content="Open CCW 是一款轻量化的第三方 CCW 社区客户端，基于svelte框架，支持 OAuth 一键授权登录、多账号管理、AES 本地加密存储 Token、每日签到领金币。是一款以安全为主要理念，便捷实用的 CCW 第三方启动器。同时提供了pwa支持。"
  />
  <meta
    name="keywords"
    content="Open CCW, CCW启动器, CCW第三方客户端, CCW签到, CCW OAuth登录"
  />
  <link rel="canonical" href="https://ccw.kivotos.qzz.io/" />
</svelte:head>

<Header></Header>

<main class="w-full flex flex-col items-center px-4 py-12 gap-10">
  <section class="flex flex-col items-center text-center gap-4 max-w-2xl">
    <img
      src={logo}
      alt="Open CCW"
      class="size-20 rounded-2xl p-2 bg-gray-700"
    />
    <h2 class="text-3xl font-bold text-text-primary font-inter">
      Welcome to Open CCW
    </h2>
    <p class="text-text-secondary leading-relaxed">
      一款以安全为主要理念的第三方 CCW 启动器，支持 OAuth
      一键授权登录、多账号管理、AES 本地加密存储 Token 与每日签到，便捷实用。
      提供了pwa支持。
    </p>
    <div class="flex flex-wrap items-center justify-center gap-3 mt-2">
      <a
        href="/register"
        class="rounded-lg bg-primary px-6 py-3 text-white font-medium hover:bg-primary-hover transition-colors"
      >
        开始使用
      </a>
      <a
        href="/oauth"
        class="rounded-lg border border-border-strong bg-bg-secondary px-6 py-3 text-text-secondary font-medium hover:bg-bg-tertiary transition-colors"
      >
        通过第三方登录
      </a>
    </div>
  </section>

  <section class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
    {#each features as { icon, title, desc }}
      <div
        class="flex flex-col items-center text-center gap-2 rounded-xl border border-border bg-bg-secondary p-6 shadow-sm"
      >
        <img src={icon} alt={title} class="size-10" />
        <h3 class="text-base font-semibold text-text-primary">{title}</h3>
        <p class="text-sm text-text-secondary">{desc}</p>
      </div>
    {/each}
  </section>
</main>
