import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { AppShell } from "@/components/app-shell";
import { Section } from "@/components/ui/card";
import {
  getAnalyticsDashboardData,
  getAnalyticsErrorMessage,
  getDefaultAnalyticsFilters
} from "@/services/spread-service";
import type { AnalyticsDashboardData, AnalyticsFilters, ChannelType, UserRole } from "@/types/spread";

function parseDays(value?: string) {
  const numeric = Number(value);
  if ([1, 7, 30, 90].includes(numeric)) return numeric as AnalyticsFilters["days"];
  return 7;
}

export default async function AdminAnalyticsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const filters = getDefaultAnalyticsFilters({
    days: parseDays(typeof params.days === "string" ? params.days : undefined),
    role: (typeof params.role === "string" ? params.role : "all") as "all" | UserRole,
    channel: (typeof params.channel === "string" ? params.channel : "all") as "all" | ChannelType,
    campaignId: typeof params.campaignId === "string" ? params.campaignId : "all"
  });

  const emptyDashboard: AnalyticsDashboardData = {
    filters,
    summary: {
      totalUsers: 0,
      newUsersToday: 0,
      newUsers7d: 0,
      newUsers30d: 0,
      visitorsToday: 0,
      sessionsToday: 0,
      pageViewsToday: 0,
      dau: 0,
      wau: 0,
      mau: 0,
      activeUsers7d: 0,
      applicationConversionRate: 0,
      submissionConversionRate: 0
    },
    timeSeries: [],
    funnel: [],
    topCampaigns: [],
    topPages: [],
    channelActivity: [],
    activeUsers: [],
    recentActivity: [],
    retention: [],
    campaigns: []
  };

  let setupMessage: string | undefined;
  const data = await getAnalyticsDashboardData(filters).catch((error: unknown) => {
    setupMessage = getAnalyticsErrorMessage(error);
    return emptyDashboard;
  });

  return (
    <AppShell role="admin">
      <Section className="py-6">
        <AnalyticsDashboard data={data} setupMessage={setupMessage} />
      </Section>
    </AppShell>
  );
}
