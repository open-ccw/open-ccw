<script lang="ts">
  import coinSvg from '#lib/assets/coin.svg';
  import { communityWeb } from '@ccw-api/api';
  import { onMount } from 'svelte';
  import Coin from './CoinImage.svelte';
  import CancelButton from '#lib/CancelButton.svelte';
  import Error from '#lib/utils/Error.svelte';
  import { scale } from 'svelte/transition';

  let { onclose, onChecked }: { onclose: () => void; onChecked: () => void } = $props();

  let checking = $state(false);
  let checkedIn = $state(false);
  let error = $state('');
  let coinCount = $state(0);
  let bucks = $state(0);

  onMount(async () => {
    try {
      const { checkInRecordResps, todayIndex } = await communityWeb.getCheckInRecords();
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
    error = '';
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
    class="bg-bg-secondary relative w-80 overflow-hidden rounded-2xl shadow-xl"
    transition:scale={{ duration: 100 }}
  >
    <!-- 顶部装饰条 -->
    <div
      class="from-primary to-primary-hover flex h-16 items-center justify-center gap-3 bg-linear-to-r"
    >
      <img src={coinSvg} alt="coin" class="h-8 w-8" />
      <span class="text-xl font-bold text-white">每日签到</span>
      <div class="absolute right-4 h-6 w-6">
        <CancelButton onclick={onclose}></CancelButton>
      </div>
    </div>

    <div class="space-y-4 p-6 text-center">
      <Error {error}></Error>

      {#if checkedIn}
        <div class="mx-auto h-16 w-16"><Coin {bucks}></Coin></div>
        <p class="text-text-primary text-lg font-bold">今日已签到</p>
        <p class="text-text-secondary text-sm">
          获得 <span class="text-success font-bold">+{bucks}</span> 金币
        </p>
        <p class="text-text-secondary text-sm">当前金币：{coinCount}</p>
        <button
          class="bg-primary hover:bg-primary-hover w-full cursor-pointer rounded-lg py-2.5 font-semibold text-white transition-colors"
          onclick={onclose}
        >
          好的
        </button>
      {:else if bucks}
        <div class="mx-auto h-16 w-16"><Coin {bucks}></Coin></div>
        <p class="text-text-secondary text-sm">
          签到即可获得金币
          <span class="text-success font-bold">+{bucks}</span>
          奖励
        </p>
        <button
          disabled={checking}
          class="bg-primary hover:bg-primary-hover w-full cursor-pointer rounded-lg py-2.5 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          onclick={handleCheckIn}
        >
          {checking ? '签到中...' : '立即签到'}
        </button>
        <button
          class="text-text-placeholder hover:text-text-secondary w-full cursor-pointer text-sm transition-colors"
          onclick={onclose}
        >
          下次再说
        </button>
      {:else if !error}
        <div>加载中...</div>
      {:else}
        <button
          class="text-text-placeholder hover:text-text-secondary w-full cursor-pointer text-sm transition-colors"
          onclick={onclose}
        >
          返回
        </button>
      {/if}
    </div>
  </div>
</div>
