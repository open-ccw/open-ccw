import InteractionIcon from '#lib/assets/notice_icon/interaction.svg';
import ReplyIcon from '#lib/assets/notice_icon/reply.svg';
import ShareIcon from '#lib/assets/notice_icon/share.svg';
import SystemIcon from '#lib/assets/notice_icon/system.svg';
import type { NotificationV3Group } from '#lib/notify/types.ts';

/** 通知标签页配置 */
export const noticeTypes: {
  type: string;
  name: string;
  icon: string;
  // 该标签页对应的 v3 通知分组（可包含多个）
  groups: NotificationV3Group[];
}[] = [
  {
    type: 'interaction',
    icon: InteractionIcon,
    name: '内容互动',
    groups: ['CONTENT_INTERACTION'],
  },
  {
    type: 'reply',
    icon: ReplyIcon,
    name: '回复我的',
    groups: ['REPLY'],
  },
  {
    type: 'share',
    icon: ShareIcon,
    name: '好友分享',
    groups: ['FRIEND_SHARE'],
  },
  {
    type: 'system',
    icon: SystemIcon,
    name: '系统消息',
    groups: ['SYSTEM', 'COMMUNITY'],
  },
] as const;
