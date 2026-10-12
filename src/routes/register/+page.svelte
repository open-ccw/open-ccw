<script lang="ts">
  import { page } from "$app/state";
  import Register from "#lib/auth/RegisterPage.svelte";
  import { onMount } from "svelte";
  import bg from "#lib/assets/registerBG.webp";
  const url = new URL(page.url);
  const token = url.searchParams.get("token") || "";
  onMount(() => {
    if (token) {
      url.searchParams.delete("token");
      history.replaceState({}, "", url);
    }
  });
</script>

<svelte:head>
  <title>注册账号 — Open CCW</title>
  <meta
    name="description"
    content="Open CCW 注册页面，CCW 一键授权自动获取 Token，仅需设置密码即可完成注册。账号数据云端保存，登录时凭学号与密码换取 Token，安全便捷的 CCW 第三方启动器。"
  />
  <link rel="preload" as="image" href={bg} />
  <link rel="canonical" href="https://ccw.kivotos.qzz.io/register" />
</svelte:head>
<Register {token}></Register>
