import {
  currentAdmin,
  currentMember,
  getCampaignViews,
  getSubmissionViews,
  userChannels
} from "@/lib/mock-data";
import type { CampaignStatus, SubmissionStatus } from "@/types/spread";

export const appMode = process.env.NEXT_PUBLIC_APP_MODE ?? "mock";

export async function listCampaigns(filters?: {
  query?: string;
  status?: CampaignStatus | "all";
  channel?: string;
  format?: string;
}) {
  const campaigns = getCampaignViews();
  return campaigns.filter((campaign) => {
    const queryMatch = filters?.query
      ? `${campaign.title} ${campaign.brand.name} ${campaign.summary}`.toLowerCase().includes(filters.query.toLowerCase())
      : true;
    const statusMatch = !filters?.status || filters.status === "all" ? true : campaign.status === filters.status;
    const channelMatch = !filters?.channel || filters.channel === "all" ? true : campaign.channels.includes(filters.channel as never);
    const formatMatch = !filters?.format || filters.format === "all" ? true : campaign.formats.includes(filters.format as never);
    return queryMatch && statusMatch && channelMatch && formatMatch;
  });
}

export async function getCampaign(id: string) {
  return getCampaignViews().find((campaign) => campaign.id === id || campaign.slug === id) ?? null;
}

export async function listMemberSubmissions(userId = currentMember.id) {
  return getSubmissionViews().filter((submission) => submission.userId === userId);
}

export async function listAdminSubmissions(status?: SubmissionStatus | "all") {
  const views = getSubmissionViews();
  return !status || status === "all" ? views : views.filter((submission) => submission.status === status);
}

export async function getMemberProfile() {
  const submissions = await listMemberSubmissions(currentMember.id);
  const approved = submissions.filter((submission) =>
    ["auto_approved", "approved", "reward_pending", "paid"].includes(submission.status)
  ).length;

  return {
    user: currentMember,
    channels: userChannels.filter((channel) => channel.userId === currentMember.id),
    stats: {
      totalSubmissions: submissions.length,
      approvalRate: submissions.length ? Math.round((approved / submissions.length) * 100) : 0,
      preferredChannel: "Threads",
      strongestFormat: "질문/한줄 반응"
    }
  };
}

export async function getAdminSummary() {
  const campaigns = getCampaignViews();
  const submissions = getSubmissionViews();
  const todaySubmissions = submissions.filter((submission) => submission.submittedAt.startsWith("2026-04-22")).length;
  const approved = submissions.filter((submission) =>
    ["auto_approved", "approved", "reward_pending", "paid"].includes(submission.status)
  ).length;
  const rewardPending = submissions.reduce((sum, submission) => sum + (submission.reward?.totalReward ?? 0), 0);

  return {
    admin: currentAdmin,
    activeCampaigns: campaigns.filter((campaign) => campaign.status === "open").length,
    todaySubmissions,
    approvalRate: Math.round((approved / submissions.length) * 100),
    rewardPending,
    autoApproved: submissions.filter((submission) => submission.status === "auto_approved").length,
    needsReview: submissions.filter((submission) => submission.status === "needs_review").length,
    recentSubmissions: submissions.slice(0, 6),
    recentCampaigns: campaigns.slice(0, 5)
  };
}
