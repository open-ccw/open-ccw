import { get, writable } from 'svelte/store';
import { communityWeb } from '#lib/api.ts';
import { browser } from '$app/env';
import { user } from '#lib/user/userStore.ts';

export const notificationStats = writable<Awaited<
  ReturnType<typeof communityWeb.getNotificationStats>
> | null>(null);

user.subscribe(async (user) => {
  if (!browser) {
    return;
  }
  if (!user.loggedIn) {
    return;
  }
  await refreshNotificationStats();
});

export async function refreshNotificationStats() {
  if (!get(user).loggedIn) {
    return;
  }
  const stats = await communityWeb.getNotificationStats();
  notificationStats.set(stats);
}
