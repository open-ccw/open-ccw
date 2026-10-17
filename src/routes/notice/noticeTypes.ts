import InteractionIcon from '#lib/assets/notice_icon/interaction.svg';
import ReplyIcon from '#lib/assets/notice_icon/reply.svg';
import ShareIcon from '#lib/assets/notice_icon/share.svg';
import SystemIcon from '#lib/assets/notice_icon/system.svg';
import type { communityWeb } from '#lib/api.ts';

type K = keyof Awaited<ReturnType<typeof communityWeb.getNotificationStats>>;

export const noticeTypes: {
  type: string;
  name: string;
  icon: string;
  statID: K[];
}[] = [
  {
    type: 'interaction',
    icon: InteractionIcon,
    name: '内容互动',
    statID: ['CREATION_INTERACTION'],
  },
  {
    type: 'reply',
    icon: ReplyIcon,
    name: '回复我的',
    statID: ['COMMENT_TO_ME'],
  },
  {
    type: 'share',
    icon: ShareIcon,
    name: '好友分享',
    statID: ['FRIEND_SHARE'],
  },
  {
    type: 'system',
    icon: SystemIcon,
    name: '系统消息',
    statID: ['WEB_SYSTEM', 'FOLLOW_ME', 'ACTIVITY_ASSISTANT', 'JUDGEMENT', 'CREATION_STATUS'],
  },
] as const;
