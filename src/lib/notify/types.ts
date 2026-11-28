import type { communityWeb } from '#lib/api.ts';

/** v3 通知分页响应类型 */
export type NotificationV3PageResponse = Awaited<
  ReturnType<typeof communityWeb.getNotificationV3Page>
>;

/** v3 单条通知类型 */
export type NotificationV3Item = NotificationV3PageResponse['items'][number];

/** v3 通知摘要类型 */
export type NotificationV3Summary = Awaited<
  ReturnType<typeof communityWeb.getNotificationV3Summary>
>;

/** v3 通知分组类型 */
export type NotificationV3Group = NotificationV3Summary['groups'][number]['group'];

/** v3 标记已读结果类型 */
export type NotificationV3MarkResult = Awaited<
  ReturnType<typeof communityWeb.markNotificationV3Read>
>;

/** 归一化后的通知内容字段 */
export type NotificationContentView = Partial<NonNullable<NotificationV3Item['content']>> & {
  comments: string;
  subject_oid: string;
  subject_outline: string;
  slug: string;
  homework_title: string;
  remixed_creation_oid: string;
  remixed_creation_title: string;
  ext?: { slug?: string };
};

/** 归一化后的通知视图，供渲染 snippet 使用 */
export type NotificationView = Omit<
  NotificationV3Item,
  'content' | 'senderInfo' | 'extensionInfo' | 'assetMarketInfo'
> & {
  content: NotificationContentView;
  senderInfo: Partial<NonNullable<NotificationV3Item['senderInfo']>>;
  extensionInfo: Partial<NonNullable<NotificationV3Item['extensionInfo']>>;
  assetMarketInfo: Omit<Partial<NonNullable<NotificationV3Item['assetMarketInfo']>>, 'path'> & {
    path: `/${string}`;
  };
  creationInfo?: { title?: string };
};
