declare type SelfUser =
  | {
      loggedIn: false;
    }
  | ({
      loggedIn: true;
    } & UserDetail);

declare type UserDetail = {
  avatar: string;
  name: string;
  oid: string;
  bio: string;
  reputationScore: {
    rank: string;
    score: number;
  };
  studentNumber: number;
  virtualValue: string;
};

declare type UserProfile = {
  avatar: string;
  name: string;
  studentOid: string;
  bio: string;
  reputationScore: {
    rank: string;
    score: number;
  };
  studentNumber: string;
  virtualValue: string;
  identityAuthRank: string;
  lastLoginAt: number;
  statistics: {
    homeworkCount: number;
    likeHomeworkCount: number;
  };
  memberArchive: {
    defaultEditor: string;
    greatCreationOid: string;
    homepageCover: string;
  } | null;
  gender: string;
  hideGender: boolean;
  birthday: number;
  studentCreatedDays: number;
  commentCount: number;
  extraInfo: {
    learnedProgrammingLanguages: string;
    selfIntroduction: string;
    programmingCapability: string;
    hobbies: string;
  };
};
