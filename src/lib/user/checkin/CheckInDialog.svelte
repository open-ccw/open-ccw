<script lang="ts">
  import coinSvg from "#lib/assets/coin.svg";
  import { communityWeb } from "@ccw-api/api";
  import { onMount } from "svelte";
  import Coin from "./CoinImage.svelte";
  import CancelButton from "#lib/CancelButton.svelte";
  import Error from "#lib/utils/Error.svelte";
  import { scale } from "svelte/transition";

  let { onclose, onChecked }: { onclose: () => void; onChecked: () => void } =
    $props();

  let checking = $state(false);
  let checkedIn = $state(false);
  let error = $state("");
  let coinCount = $state(0);
  let bucks = $state(0);

  onMount(async () => {
    try {
      const { checkInRecordResps, todayIndex } =
        await communityWeb.getCheckInRecords();
      const today = checkInRecordResps[todayIndex];
      checkedIn = today.isCheckIn;
      bucks = today.bucks;
      coinCount = await communityWeb
        .getPersonalCurrencyAccount()
        .then((res) => res.internalCurrencyBalance);
    } catch (e) {
      error = String(e);
    }
  });

  async function handleCheckIn() {
    if (checking) return;
    checking = true;
    error = "";
    try {
      await communityWeb.insertCheckInRecord();
      coinCount += bucks;
      checkedIn = true;
      onChecked();
    } catch (e) {
      error = String(e);
    } finally {
      checking = false;
    }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
  <div
    class="bg-bg-secondary w-80 rounded-2xl shadow-xl overflow-hidden relative"
    transition:scale={{ duration: 100 }}
  >
    <!-- 顶部装饰条 -->
    <div
      class="bg-linear-to-r from-primary to-primary-hover h-16 flex items-center justify-center gap-3"
    >
      <img src={coinSvg} alt="coin" class="w-8 h-8" />
      <span class="text-white text-xl font-bold">每日签到</span>
      <div class="absolute right-4 w-6 h-6">
        <CancelButton onclick={onclose}></CancelButton>
      </div>
    </div>

    <div class="p-6 text-center space-y-4">
      <Error {error}></Error>

      {#if checkedIn}
        <div class="w-16 h-16 mx-auto"><Coin {bucks}></Coin></div>
        <p class="text-lg font-bold text-text-primary">今日已签到</p>
        <p class="text-text-secondary text-sm">
          获得 <span class="text-success font-bold">+{bucks}</span> 金币
        </p>
        <p class="text-text-secondary text-sm">当前金币：{coinCount}</p>
        <button
          class="w-full rounded-lg bg-primary text-white font-semibold py-2.5 hover:bg-primary-hover transition-colors cursor-pointer"
          onclick={onclose}
        >
          好的
        </button>
      {:else if bucks}
        <div class="w-16 h-16 mx-auto"><Coin {bucks}></Coin></div>
        <p class="text-text-secondary text-sm">
          签到即可获得金币
          <span class="text-success font-bold">+{bucks}</span>
          奖励
        </p>
        <button
          disabled={checking}
          class="w-full rounded-lg bg-primary text-white font-semibold py-2.5 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          onclick={handleCheckIn}
        >
          {checking ? "签到中..." : "立即签到"}
        </button>
        <button
          class="w-full text-text-placeholder text-sm hover:text-text-secondary transition-colors cursor-pointer"
          onclick={onclose}
        >
          下次再说
        </button>
      {:else if !error}
        <div>加载中...</div>
      {:else}
        <button
          class="w-full text-text-placeholder text-sm hover:text-text-secondary transition-colors cursor-pointer"
          onclick={onclose}
        >
          返回
        </button>
      {/if}
    </div>
  </div>
</div>
