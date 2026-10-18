export type TopicConfig = {
  oid: string;
  subjectType: 'EXTENSION' | 'POST' | 'CREATION' | 'PROFILE';
  sectionType: 'COMMENT' | 'REVIEW';
};

export type MinimalComment = {
  id: number;
  /** 评论所属话题 id，读取该评论的回复列表时需要 */
  topicId: number;
  commenter: {
    accountOid: string;
    avatar: string;
    name: string;
    virtualValue?: string;
    approvalTagRelations: any[] | null;
  };
  content: string;
  createdAt: number;
  likeCount: number;
  replyCount: number | null;
  weight?: number | null;
  liked?: boolean;
};

/** 回复目标：被回复评论的定位参数与展示信息 */
export type ReplyTarget = {
  /** 被回复评论的 id，作为回复接口的 replyToId */
  id: number;
  /** 被回复评论所属话题 id，读取回复列表需要 */
  topicId: number;
  /** 被回复者昵称，用于输入框提示 */
  name: string;
  /** 已有回复数，用于折叠态展示 */
  replyCount: number;
};
