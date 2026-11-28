import { get, writable } from 'svelte/store';
import { communityWeb } from '#lib/api.ts';
import { browser } from '$app/env';
import { user } from '#lib/user/userStore.ts';
import { toast } from '#lib';
import type {
  NotificationV3Group,
  NotificationV3MarkResult,
  NotificationV3Summary,
} from './types.ts';

/** v3 通知摘要 store */
export const notificationSummary = writable<NotificationV3Summary | null>(null);

user.subscribe(async (user) => {
  if (!browser) {
    return;
  }
  if (!user.loggedIn) {
    notificationSummary.set(null);
    return;
  }
  await refreshNotificationSummary();
});

/** 刷新 v3 通知摘要；失败时保留已有数据并提示用户 */
export async function refreshNotificationSummary() {
  if (!get(user).loggedIn) {
    return;
  }
  try {
    const summary = await communityWeb.getNotificationV3Summary(false);
    notificationSummary.set(summary);
  } catch (e) {
    toast.error(`通知未读数刷新失败：${String(e)}`);
  }
}

/** 获取指定分组的未读数 */
export function getGroupUnread(
  summary: NotificationV3Summary | null,
  group: NotificationV3Group,
): number {
  return summary?.groups.find((g) => g.group === group)?.unreadCount ?? 0;
}

/**
 * 用 v3 readToken 标记已读，按服务端 retryAfterMs 重试至完成
 * @param group 分组，"ALL" 表示全部分组
 * @param readToken 服务端下发的已读令牌
 */
export async function markNotificationRead(group: NotificationV3Group | 'ALL', readToken: string) {
  if (!readToken) {
    return;
  }
  let token = readToken;
  for (;;) {
    let result: NotificationV3MarkResult;
    try {
      result = await communityWeb.markNotificationV3Read(group, token);
    } catch (e) {
      throw new Error(`标记 ${group} 已读失败：${String(e)}`);
    }
    if (result.summaryInvalidated) {
      await refreshNotificationSummary();
    }
    if (result.completed || result.retryAfterMs <= 0) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, result.retryAfterMs));
  }
}

/** 标记全部 v3 通知已读；返回是否存在需要标记的消息 */
export async function markAllNotificationsRead(): Promise<boolean> {
  const summary = get(notificationSummary);
  if (!summary?.markAll || summary.totalUnread <= 0) {
    return false;
  }
  await markNotificationRead('ALL', summary.markAll);
  await refreshNotificationSummary();
  return true;
}
