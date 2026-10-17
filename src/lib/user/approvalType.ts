import type { communityWeb } from '#lib/api.ts';
export type ApprovalTagType = Awaited<ReturnType<typeof communityWeb.getApprovalTags>>[number];
