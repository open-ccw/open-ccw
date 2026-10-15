export type TopicConfig = {
  oid: string;
  subjectType: "EXTENSION" | "POST" | "CREATION" | "PROFILE";
  sectionType: "COMMENT" | "REVIEW";
};

export type MinimalComment = {
  id: number;
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
