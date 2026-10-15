<script lang="ts">
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";
  import { page } from "$app/state";
  import { communityWeb } from "#lib/api.ts";

  let { params }: PageProps = $props();

  let canvas: HTMLCanvasElement | undefined = $state();
  let loading = $state(false);
  let complete = $state(false);
  let safe = $state(false);
  let oid: string = $derived(params.oid || "69740f1a61b891733d5ee2c6");
  let sb3: string = $derived.by(() => {
    const orig = page.url.searchParams.get("sb3");
    if (orig) {
      return orig;
    }
    loadVersion();
    return "";
  });
  let usePostMessage: boolean = $derived(
    !(page.url.searchParams.get("usePostMessage") === "false"),
  );
  let player: typeof import("@open-ccw/player") | undefined = $state();
  let rpc: typeof import("@mixer/postmessage-rpc") | undefined = $state();

  async function loadVersion() {
    const { latestProjectLink } = await communityWeb.getCreationDetail(oid, "");
    sb3 = latestProjectLink;
  }

  $effect(() => {
    if (canvas && safe && sb3 && player) {
      setTimeout(initPlayer, 10);
    }
  });

  onMount(() => {
    if (window.origin != "null") {
      safe = confirm("使用player直接运行未知作品可能造成token泄露,是否继续?");
    } else {
      safe = true;
    }
    if (usePostMessage) {
      import("@mixer/postmessage-rpc").then((lib) => (rpc = lib));
    }
    import("@open-ccw/player").then((lib) => (player = lib));
  });

  async function initPlayer() {
    if (loading || complete || !canvas || !player) {
      return;
    }
    complete = false;
    loading = true;

    const { vm } = await player.init(canvas, () => null);
    vm.setCCWAPI(player.ccwApi({ vm, projectOid: oid }));
    await player.loadProjectURL(new URL(sb3), vm, (args) => {
      return Promise.resolve([false, null]);
    });
    vm.runtime.ccwAPI.getUserInfo = () => {
      return Promise.resolve({
        userId: "a",
      });
    };
    vm.runtime.precompile();
    vm.runtime.setCompilerOptions({
      enabled: true,
      warpTimer: true,
    });
    player.updateStageSize(vm, 640, 360);
    vm.runtime.renderer?.resize(1920, 1080);
    complete = true;
    loading = false;
    vm.greenFlag();
  }
</script>

<div class="w-screen h-screen">
  <canvas bind:this={canvas} class="w-full h-full object-contain"></canvas>
</div>
