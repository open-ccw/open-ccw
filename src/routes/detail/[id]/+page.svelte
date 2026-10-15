<script lang="ts">
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";
  import { communityWeb, type Creation } from "#lib/api.ts";
  import Error from "#lib/utils/Error.svelte";
  let { params }: PageProps = $props();

  let error = $state("");
  let creation: Creation.Creation | null = $state(null);

  onMount(async () => {
    try {
      creation = await communityWeb.getCreationDetail(params.id, "");
    } catch (e) {
      error = String(e);
    }
  });
</script>

<svelte:head>
  <title
    >{creation?.title
      ? `${creation.title} — Open CCW`
      : "作品详情 — Open CCW"}</title
  >
  {#if creation?.title}
    <meta
      name="description"
      content="{creation.title} - 查看 CCW 社区作品详情，包括作品信息、作者等。Open CCW 第三方 CCW 启动器。"
    />
  {/if}
  <link
    rel="canonical"
    href={`https://ccw.kivotos.qzz.io/detail/${params.id}`}
  />
</svelte:head>

<Error {error}></Error>
<details>
  <summary>作品元数据</summary>
  <div class="whitespace-break-spaces text-xs">
    {JSON.stringify(creation, null, 2)}
  </div>
</details>
<iframe
  src="/player/{params.id}"
  title="player"
  sandbox="allow-scripts allow-storage-access-by-user-activation allow-modals"
  class="w-160 h-90"
></iframe>
<a href="https://ccw.site/detail/{params.id}">跳转到ccw</a>
