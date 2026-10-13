import type { communityWeb } from "#lib/api";
export type ApprovalTagType = Awaited<
  ReturnType<typeof communityWeb.getApprovalTags>
>[number];
