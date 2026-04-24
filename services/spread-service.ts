import * as mock from "@/lib/mock-data";
import {
  getAnalyticsDashboardData as getLiveAnalyticsDashboardData,
  getAnalyticsErrorMessage as getLiveAnalyticsErrorMessage
} from "@/services/analytics-service";
import * as real from "@/services/supabase-service";
import { hasSupabaseEnv } from "@/supabase/env";
import type {
  AnalyticsActivityFeedRow,
  AnalyticsBottleneckCampaignRow,
  AnalyticsConversionSummary,
  AnalyticsDashboardData,
  AnalyticsEventName,
  AnalyticsFilters,
  AnalyticsDropoffCampaignRow,
  AnalyticsRetentionPoint,
  AnalyticsTimeToActionSummary,
  AnalyticsTimeSeriesPoint,
  AnalyticsTopCampaignRow,
  AnalyticsTopPageRow,
  AnalyticsUserActivityRow,
  ApplicationStatus,
  CampaignApplicationView,
  CampaignDraftPreset,
  CampaignStatus,
  CampaignView,
  ChannelType,
  FulfillmentInfo,
  SubmissionChecklistItem,
  SubmissionEligibility,
  SubmissionStatus,
  SubmissionView,
  User,
  UserPenalty
} from "@/types/spread";

// Supabase 환경 변수가 있으면 real 모드, 없으면 mock 모드
const isLive = hasSupabaseEnv();

type MockAnalyticsEvent = {
  id: string;
  eventName: AnalyticsEventName;
  visitorId: string;
  sessionId: string;
  userId?: string;
  userRole?: User["role"];
  path: string;
  campaignId?: string;
  channelType?: ChannelType;
  metadata?: Record<string, unknown>;
  occurredAt: string;
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function asPercent(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;
}

function buildDateBuckets(days: number) {
  const today = startOfDay(new Date());
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(today, -(days - index - 1));
    return date.toISOString().slice(0, 10);
  });
}

function withinRange(value: string, start: Date) {
  return new Date(value).getTime() >= start.getTime();
}

function matchesAnalyticsRole(role: User["role"] | undefined, filter: AnalyticsFilters["role"]) {
  if (!filter || filter === "all") return true;
  return role === filter;
}

function matchesAnalyticsChannel(channelType: ChannelType | undefined, filter: AnalyticsFilters["channel"]) {
  if (!filter || filter === "all") return true;
  return channelType === filter;
}

function matchesAnalyticsCampaign(campaignId: string | undefined, filter: AnalyticsFilters["campaignId"]) {
  if (!filter || filter === "all") return true;
  return campaignId === filter;
}

function filterMockAnalyticsEvents(events: MockAnalyticsEvent[], filters: AnalyticsFilters) {
  const start = addDays(startOfDay(new Date()), -(filters.days - 1));
  return events.filter((event) =>
    withinRange(event.occurredAt, start) &&
    matchesAnalyticsRole(event.userRole, filters.role) &&
    matchesAnalyticsChannel(event.channelType, filters.channel) &&
    matchesAnalyticsCampaign(event.campaignId, filters.campaignId)
  );
}

function averageHours(values: number[]) {
  if (!values.length) return undefined;
  return Math.round((values.reduce((total, value) => total + value, 0) / values.length) * 10) / 10;
}

function diffHours(start?: string | null, end?: string | null) {
  if (!start || !end) return undefined;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  if (Number.isNaN(diff) || diff < 0) return undefined;
  return diff / (1000 * 60 * 60);
}

function isProcessedStatus(status: SubmissionStatus) {
  return ["approved", "fulfillment_pending", "completed"].includes(status);
}

function createMockAnalyticsEvents() {
  const events: MockAnalyticsEvent[] = [];
  const baseVisitors = new Map<string, string>();
  const basePathByRole: Record<User["role"], string> = {
    member: "/member",
    brand: "/brand",
    admin: "/admin"
  };

  mock.users.forEach((user, index) => {
    const visitorId = `visitor-${user.id}`;
    baseVisitors.set(user.id, visitorId);

    events.push({
      id: `signup-${user.id}`,
      eventName: "sign_up_completed",
      visitorId,
      sessionId: `session-signup-${user.id}`,
      userId: user.id,
      userRole: user.role,
      path: "/login",
      occurredAt: user.createdAt
    });

    events.push({
      id: `login-${user.id}`,
      eventName: "login_completed",
      visitorId,
      sessionId: `session-login-${user.id}`,
      userId: user.id,
      userRole: user.role,
      path: "/login",
      occurredAt: addDays(new Date(user.createdAt), 1).toISOString()
    });

    for (let offset = 0; offset < 12; offset += 1) {
      const activeDate = addDays(new Date("2026-04-24T00:00:00.000Z"), -offset);
      if (activeDate.getTime() < new Date(user.createdAt).getTime()) continue;
      const sessionId = `session-${user.id}-${offset}`;
      events.push({
        id: `view-home-${user.id}-${offset}`,
        eventName: "page_view",
        visitorId,
        sessionId,
        userId: user.id,
        userRole: user.role,
        path: basePathByRole[user.role],
        occurredAt: new Date(activeDate.getTime() + (9 + index) * 60 * 60 * 1000).toISOString()
      });

      if (user.role === "member" && offset % 2 === 0) {
        events.push({
          id: `view-campaign-list-${user.id}-${offset}`,
          eventName: "page_view",
          visitorId,
          sessionId,
          userId: user.id,
          userRole: user.role,
          path: "/member/campaigns",
          occurredAt: new Date(activeDate.getTime() + (10 + index) * 60 * 60 * 1000).toISOString()
        });
      }
    }
  });

  mock.userChannels.forEach((channel, index) => {
    const user = mock.users.find((candidate) => candidate.id === channel.userId);
    if (!user) return;
    events.push({
      id: `channel-${channel.id}`,
      eventName: "channel_saved",
      visitorId: baseVisitors.get(user.id) ?? `visitor-${user.id}`,
      sessionId: `session-channel-${user.id}-${index}`,
      userId: user.id,
      userRole: user.role,
      path: "/member/profile",
      channelType: channel.channelType,
      occurredAt: addDays(new Date(channel.createdAt), 1).toISOString()
    });
  });

  mock.campaignApplications.forEach((application, index) => {
    const user = mock.users.find((candidate) => candidate.id === application.userId);
    const campaign = mock.campaigns.find((candidate) => candidate.id === application.campaignId);
    if (!user || !campaign) return;
    const visitorId = baseVisitors.get(user.id) ?? `visitor-${user.id}`;
    const campaignPath = `/member/campaigns/${campaign.id}`;
    const viewedAt = new Date(new Date(application.appliedAt).getTime() - 20 * 60 * 1000).toISOString();

    events.push({
      id: `campaign-page-view-${application.id}`,
      eventName: "page_view",
      visitorId,
      sessionId: `session-application-${application.id}`,
      userId: user.id,
      userRole: user.role,
      path: campaignPath,
      occurredAt: viewedAt
    });

    events.push({
      id: `campaign-view-${application.id}`,
      eventName: "campaign_viewed",
      visitorId,
      sessionId: `session-application-${application.id}`,
      userId: user.id,
      userRole: user.role,
      path: campaignPath,
      campaignId: campaign.id,
        channelType: application.channelType,
      metadata: { channels: [application.channelType] },
      occurredAt: new Date(new Date(application.appliedAt).getTime() - 10 * 60 * 1000).toISOString()
    });

    events.push({
      id: `campaign-applied-${application.id}`,
      eventName: "campaign_applied",
      visitorId,
      sessionId: `session-application-${application.id}`,
      userId: user.id,
      userRole: user.role,
      path: `/member/apply/${campaign.id}`,
      campaignId: campaign.id,
      channelType: application.channelType,
      occurredAt: application.appliedAt
    });

    if (application.status === "selected" && application.decidedAt) {
      events.push({
        id: `application-selected-${application.id}`,
        eventName: "application_selected",
        visitorId,
        sessionId: `session-application-selected-${application.id}`,
        userId: user.id,
        userRole: user.role,
        path: `/admin/campaigns/${campaign.id}/applications`,
        campaignId: campaign.id,
        channelType: application.channelType,
        occurredAt: application.decidedAt
      });
    }
  });

  mock.getSubmissionViews().forEach((submission, index) => {
    events.push({
      id: `submission-started-${submission.id}`,
      eventName: "submission_started",
      visitorId: baseVisitors.get(submission.userId) ?? `visitor-${submission.userId}`,
      sessionId: `session-submission-${submission.id}`,
      userId: submission.userId,
      userRole: submission.user.role,
      path: `/member/submit/${submission.campaignId}`,
      campaignId: submission.campaignId,
      channelType: submission.channelType,
      occurredAt: new Date(new Date(submission.submittedAt).getTime() - 90 * 60 * 1000).toISOString()
    });

    events.push({
      id: `submission-completed-${submission.id}`,
      eventName: "submission_completed",
      visitorId: baseVisitors.get(submission.userId) ?? `visitor-${submission.userId}`,
      sessionId: `session-submission-${submission.id}`,
      userId: submission.userId,
      userRole: submission.user.role,
      path: `/member/submit/${submission.campaignId}`,
      campaignId: submission.campaignId,
      channelType: submission.channelType,
      occurredAt: submission.submittedAt
    });

    events.push({
      id: `profile-view-${submission.id}`,
      eventName: "page_view",
      visitorId: baseVisitors.get(submission.userId) ?? `visitor-${submission.userId}`,
      sessionId: `session-submission-${submission.id}`,
      userId: submission.userId,
      userRole: submission.user.role,
      path: "/member/profile",
      occurredAt: new Date(new Date(submission.submittedAt).getTime() + 20 * 60 * 1000).toISOString()
    });
  });

  Array.from({ length: 18 }).forEach((_, index) => {
    const occurredAt = new Date(new Date("2026-04-24T00:00:00.000Z").getTime() - index * 8 * 60 * 60 * 1000).toISOString();
    events.push({
      id: `anon-home-${index}`,
      eventName: "page_view",
      visitorId: `visitor-anon-${index % 6}`,
      sessionId: `session-anon-home-${index}`,
      path: index % 3 === 0 ? "/" : index % 3 === 1 ? "/login" : "/member/campaigns",
      occurredAt
    });
  });

  return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

function buildMockAnalyticsDashboard(filters: AnalyticsFilters): AnalyticsDashboardData {
  const events = filterMockAnalyticsEvents(createMockAnalyticsEvents(), filters);
  const users = mock.users;
  const campaigns = mock.getCampaignViews();
  const applicationsData = mock.campaignApplications.filter((application) =>
    matchesAnalyticsChannel(application.channelType, filters.channel) &&
    matchesAnalyticsCampaign(application.campaignId, filters.campaignId)
  );
  const submissionsData = mock.getSubmissionViews().filter((submission) =>
    matchesAnalyticsChannel(submission.channelType, filters.channel) &&
    matchesAnalyticsCampaign(submission.campaignId, filters.campaignId)
  );
  const usersCreatedAt = users.map((user) => user.createdAt);
  const today = startOfDay(new Date());
  const last7 = addDays(today, -6);
  const last30 = addDays(today, -29);
  const pageViews = events.filter((event) => event.eventName === "page_view");
  const applications = events.filter((event) => event.eventName === "campaign_applied");
  const submissions = events.filter((event) => event.eventName === "submission_completed");
  const signedUp = events.filter((event) => event.eventName === "sign_up_completed");
  const userEvents = events.filter((event) => event.userId);
  const usersById = new Map(users.map((user) => [user.id, user]));

  const timeSeries: AnalyticsTimeSeriesPoint[] = buildDateBuckets(filters.days).map((date) => {
    const dayEvents = events.filter((event) => event.occurredAt.slice(0, 10) === date);
    return {
      date,
      visitors: new Set(dayEvents.map((event) => event.visitorId)).size,
      sessions: new Set(dayEvents.map((event) => event.sessionId)).size,
      pageViews: dayEvents.filter((event) => event.eventName === "page_view").length,
      signUps: usersCreatedAt.filter((createdAt) => createdAt.slice(0, 10) === date).length,
      applications: dayEvents.filter((event) => event.eventName === "campaign_applied").length,
      selected: dayEvents.filter((event) => event.eventName === "application_selected").length,
      submissions: dayEvents.filter((event) => event.eventName === "submission_completed").length
    };
  });

  const funnel = [
    { key: "visit", label: "방문", count: new Set(pageViews.map((event) => event.visitorId)).size },
    { key: "signup", label: "가입", count: signedUp.length },
    { key: "campaign_view", label: "캠페인 조회", count: events.filter((event) => event.eventName === "campaign_viewed").length },
    { key: "apply", label: "신청", count: applications.length },
    { key: "selected", label: "선정", count: events.filter((event) => event.eventName === "application_selected").length },
    { key: "submit", label: "제출 완료", count: submissions.length }
  ].map((step, index, steps) => ({
    ...step,
    conversionFromPrevious: index === 0 ? undefined : asPercent(step.count, steps[index - 1].count)
  }));

  const topPages: AnalyticsTopPageRow[] = Array.from(
    pageViews.reduce((map, event) => {
      const current = map.get(event.path) ?? { path: event.path, routePattern: event.path, views: 0, visitors: new Set<string>() };
      current.views += 1;
      current.visitors.add(event.visitorId);
      map.set(event.path, current);
      return map;
    }, new Map<string, { path: string; routePattern: string; views: number; visitors: Set<string> }>())
  )
    .map(([, value]) => ({
      path: value.path,
      routePattern: value.routePattern,
      views: value.views,
      uniqueVisitors: value.visitors.size,
      avgViewsPerVisitor: value.visitors.size ? Math.round((value.views / value.visitors.size) * 10) / 10 : 0
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  const topCampaigns: AnalyticsTopCampaignRow[] = campaigns
    .map((campaign) => {
      const campaignEvents = events.filter((event) => event.campaignId === campaign.id);
      const campaignApplications = applicationsData.filter((application) => application.campaignId === campaign.id);
      const campaignSubmissions = submissionsData.filter((submission) => submission.campaignId === campaign.id);
      const views = campaignEvents.filter((event) => event.eventName === "campaign_viewed").length;
      const applicationCount = campaignApplications.length;
      const selectedCount = campaignApplications.filter((application) => application.status === "selected").length;
      const submissionStartedCount = campaignEvents.filter((event) => event.eventName === "submission_started").length;
      const submissionCount = campaignSubmissions.length;
      const processedCount = campaignSubmissions.filter((submission) => isProcessedStatus(submission.status)).length;
      return {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        brandName: campaign.brand.name,
        views,
        applications: applicationCount,
        selected: selectedCount,
        submissionStarted: submissionStartedCount,
        submissions: submissionCount,
        processed: processedCount,
        applicationConversionRate: asPercent(applicationCount, views),
        selectionConversionRate: asPercent(selectedCount, applicationCount),
        submissionStartConversionRate: asPercent(submissionStartedCount, selectedCount),
        submissionConversionRate: asPercent(submissionCount, applicationCount),
        processedConversionRate: asPercent(processedCount, submissionCount)
      };
    })
    .filter((campaign) => campaign.views || campaign.applications || campaign.submissions)
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  const conversionSummary: AnalyticsConversionSummary = {
    viewToApplyRate: asPercent(applicationsData.length, events.filter((event) => event.eventName === "campaign_viewed").length),
    applyToSelectedRate: asPercent(applicationsData.filter((application) => application.status === "selected").length, applicationsData.length),
    selectedToSubmissionStartedRate: asPercent(
      events.filter((event) => event.eventName === "submission_started").length,
      applicationsData.filter((application) => application.status === "selected").length
    ),
    submissionStartedToCompletedRate: asPercent(
      submissionsData.length,
      events.filter((event) => event.eventName === "submission_started").length
    ),
    submissionCompletedToProcessedRate: asPercent(
      submissionsData.filter((submission) => isProcessedStatus(submission.status)).length,
      submissionsData.length
    ),
    views: events.filter((event) => event.eventName === "campaign_viewed").length,
    applications: applicationsData.length,
    selected: applicationsData.filter((application) => application.status === "selected").length,
    submissionStarted: events.filter((event) => event.eventName === "submission_started").length,
    submissionCompleted: submissionsData.length,
    processed: submissionsData.filter((submission) => isProcessedStatus(submission.status)).length
  };

  const submissionStartedMap = new Map(
    events
      .filter((event) => event.eventName === "submission_started" && event.campaignId && event.userId && event.channelType)
      .map((event) => [`${event.campaignId}:${event.userId}:${event.channelType}`, event.occurredAt])
  );

  const timeToActionSummary: AnalyticsTimeToActionSummary = {
    applyToSelectedHours: averageHours(
      applicationsData
        .map((application) => diffHours(application.appliedAt, application.decidedAt))
        .filter((value): value is number => value !== undefined)
    ),
    selectedToSubmissionStartedHours: averageHours(
      applicationsData
        .filter((application) => application.status === "selected")
        .map((application) =>
          diffHours(
            application.decidedAt,
            submissionStartedMap.get(`${application.campaignId}:${application.userId}:${application.channelType}`)
          )
        )
        .filter((value): value is number => value !== undefined)
    ),
    submissionStartedToCompletedHours: averageHours(
      submissionsData
        .map((submission) =>
          diffHours(
            submissionStartedMap.get(`${submission.campaignId}:${submission.userId}:${submission.channelType}`),
            submission.submittedAt
          )
        )
        .filter((value): value is number => value !== undefined)
    ),
    submissionCompletedToProcessedHours: averageHours(
      submissionsData
        .filter((submission) => isProcessedStatus(submission.status))
        .map((submission) => diffHours(submission.submittedAt, submission.reviewedAt))
        .filter((value): value is number => value !== undefined)
    )
  };

  const dropoffCampaigns: AnalyticsDropoffCampaignRow[] = topCampaigns
    .map((campaign) => {
      const applyToSubmissionRate = asPercent(campaign.submissions, campaign.applications);
      return {
        campaignId: campaign.campaignId,
        campaignTitle: campaign.campaignTitle,
        brandName: campaign.brandName,
        views: campaign.views,
        applications: campaign.applications,
        selected: campaign.selected,
        submissions: campaign.submissions,
        viewToApplyRate: campaign.applicationConversionRate,
        applyToSubmissionRate,
        primaryDropoff:
          (100 - campaign.applicationConversionRate >= 100 - applyToSubmissionRate ? "view_to_apply" : "apply_to_submission") as "view_to_apply" | "apply_to_submission"
      };
    })
    .sort((a, b) => {
      const aScore = a.primaryDropoff === "view_to_apply" ? a.viewToApplyRate : a.applyToSubmissionRate;
      const bScore = b.primaryDropoff === "view_to_apply" ? b.viewToApplyRate : b.applyToSubmissionRate;
      return aScore - bScore;
    })
    .slice(0, 6);

  const bottleneckCampaigns: AnalyticsBottleneckCampaignRow[] = campaigns
    .map((campaign) => {
      const campaignApplications = applicationsData.filter((application) => application.campaignId === campaign.id);
      const campaignSubmissions = submissionsData.filter((submission) => submission.campaignId === campaign.id);
      return {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        brandName: campaign.brand.name,
        applyToSelectedHours: averageHours(
          campaignApplications
            .map((application) => diffHours(application.appliedAt, application.decidedAt))
            .filter((value): value is number => value !== undefined)
        ),
        selectedToSubmissionStartedHours: averageHours(
          campaignApplications
            .filter((application) => application.status === "selected")
            .map((application) =>
              diffHours(
                application.decidedAt,
                submissionStartedMap.get(`${application.campaignId}:${application.userId}:${application.channelType}`)
              )
            )
            .filter((value): value is number => value !== undefined)
        ),
        submissionCompletedToProcessedHours: averageHours(
          campaignSubmissions
            .filter((submission) => isProcessedStatus(submission.status))
            .map((submission) => diffHours(submission.submittedAt, submission.reviewedAt))
            .filter((value): value is number => value !== undefined)
        )
      };
    })
    .filter((campaign) =>
      campaign.applyToSelectedHours !== undefined ||
      campaign.selectedToSubmissionStartedHours !== undefined ||
      campaign.submissionCompletedToProcessedHours !== undefined
    )
    .sort((a, b) => {
      const aMax = Math.max(a.applyToSelectedHours ?? 0, a.selectedToSubmissionStartedHours ?? 0, a.submissionCompletedToProcessedHours ?? 0);
      const bMax = Math.max(b.applyToSelectedHours ?? 0, b.selectedToSubmissionStartedHours ?? 0, b.submissionCompletedToProcessedHours ?? 0);
      return bMax - aMax;
    })
    .slice(0, 6);

  const channelActivity = (["threads", "x", "wordpress", "kakao"] as ChannelType[]).map((channelType) => ({
    channelType,
    pageViews: events.filter((event) => event.eventName === "campaign_viewed" && event.channelType === channelType).length,
    applications: events.filter((event) => event.eventName === "campaign_applied" && event.channelType === channelType).length,
    submissions: events.filter((event) => event.eventName === "submission_completed" && event.channelType === channelType).length
  }));

  const recentActivity: AnalyticsActivityFeedRow[] = events.slice(0, 20).map((event) => ({
    id: event.id,
    occurredAt: event.occurredAt,
    eventName: event.eventName,
    label: {
      page_view: "페이지 조회",
      sign_up_completed: "회원가입 완료",
      login_completed: "로그인 완료",
      campaign_viewed: "캠페인 조회",
      campaign_applied: "캠페인 신청",
      application_selected: "신청 선정",
      submission_started: "제출 시작",
      submission_completed: "제출 완료",
      channel_saved: "채널 저장"
    }[event.eventName],
    path: event.path,
    nickname: event.userId ? usersById.get(event.userId)?.nickname : undefined,
    userRole: event.userRole
  }));

  const activeUsers: AnalyticsUserActivityRow[] = Array.from(
    userEvents
      .filter((event) => withinRange(event.occurredAt, last7))
      .reduce((map, event) => {
        const key = event.userId as string;
        const current = map.get(key) ?? [];
        current.push(event);
        map.set(key, current);
        return map;
      }, new Map<string, MockAnalyticsEvent[]>())
  )
    .map(([userId, userEventList]) => {
      const lastEvent = [...userEventList].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];
      const user = usersById.get(userId);
      return {
        userId,
        nickname: user?.nickname ?? "알 수 없음",
        role: user?.role ?? "member",
        lastSeenAt: lastEvent.occurredAt,
        pageViews: userEventList.filter((event) => event.eventName === "page_view").length,
        applications: userEventList.filter((event) => event.eventName === "campaign_applied").length,
        submissions: userEventList.filter((event) => event.eventName === "submission_completed").length,
        lastActionLabel: recentActivity.find((row) => row.id === lastEvent.id)?.label ?? "활동"
      };
    })
    .sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime())
    .slice(0, 12);

  const retention: AnalyticsRetentionPoint[] = users
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8)
    .map((user) => {
      const userActivity = userEvents.filter((event) => event.userId === user.id);
      const created = new Date(user.createdAt).getTime();
      const seenDay = (targetDay: number) =>
        userActivity.some((event) => {
          const diffDays = Math.floor((new Date(event.occurredAt).getTime() - created) / (24 * 60 * 60 * 1000));
          return diffDays === targetDay;
        });
      return {
        cohortDate: user.createdAt.slice(0, 10),
        cohortSize: 1,
        day1Rate: seenDay(1) ? 100 : 0,
        day7Rate: seenDay(7) ? 100 : 0,
        day30Rate: seenDay(30) ? 100 : 0
      };
    });

  return {
    filters,
    summary: {
      totalUsers: users.length,
      newUsersToday: usersCreatedAt.filter((createdAt) => withinRange(createdAt, today)).length,
      newUsers7d: usersCreatedAt.filter((createdAt) => withinRange(createdAt, last7)).length,
      newUsers30d: usersCreatedAt.filter((createdAt) => withinRange(createdAt, last30)).length,
      visitorsToday: new Set(events.filter((event) => withinRange(event.occurredAt, today)).map((event) => event.visitorId)).size,
      sessionsToday: new Set(events.filter((event) => withinRange(event.occurredAt, today)).map((event) => event.sessionId)).size,
      pageViewsToday: pageViews.filter((event) => withinRange(event.occurredAt, today)).length,
      dau: new Set(userEvents.filter((event) => withinRange(event.occurredAt, today)).map((event) => event.userId)).size,
      wau: new Set(userEvents.filter((event) => withinRange(event.occurredAt, last7)).map((event) => event.userId)).size,
      mau: new Set(userEvents.filter((event) => withinRange(event.occurredAt, last30)).map((event) => event.userId)).size,
      activeUsers7d: new Set(userEvents.filter((event) => withinRange(event.occurredAt, last7)).map((event) => event.userId)).size,
      applicationConversionRate: asPercent(applications.length, pageViews.length),
      submissionConversionRate: asPercent(submissions.length, applications.length)
    },
    conversionSummary,
    timeToActionSummary,
    timeSeries,
    funnel,
    topCampaigns,
    dropoffCampaigns,
    bottleneckCampaigns,
    topPages,
    channelActivity,
    activeUsers,
    recentActivity,
    retention,
    campaigns: campaigns.map((campaign) => ({ id: campaign.id, title: campaign.title }))
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Current user
// ────────────────────────────────────────────────────────────────────────────

export async function getServerUser(): Promise<User | null> {
  if (isLive) return real.getServerUser();
  return mock.currentMember;
}

export async function getBrandIdForUser(userId: string): Promise<string | null> {
  if (isLive) return real.getBrandIdForUser(userId);
  return userId === "user-brand-1" ? "brand-1" : "brand-1";
}

// ────────────────────────────────────────────────────────────────────────────
// Campaigns
// ────────────────────────────────────────────────────────────────────────────

export async function listCampaigns(filters?: {
  query?: string;
  status?: CampaignStatus | "all";
  channel?: string;
}): Promise<CampaignView[]> {
  if (isLive) return real.listCampaigns(filters);

  const campaigns = mock.getCampaignViews();
  return campaigns.filter((campaign) => {
    const queryMatch = filters?.query
      ? `${campaign.title} ${campaign.brand.name} ${campaign.summary}`.toLowerCase().includes(filters.query.toLowerCase())
      : true;
    const statusMatch = !filters?.status || filters.status === "all" ? true : campaign.status === filters.status;
    const channelMatch = !filters?.channel || filters.channel === "all" ? true : campaign.channels.includes(filters.channel as never);
    return queryMatch && statusMatch && channelMatch;
  });
}

export async function getCampaign(id: string): Promise<CampaignView | null> {
  if (isLive) return real.getCampaign(id);
  return mock.getCampaignViews().find((c) => c.id === id || c.slug === id) ?? null;
}

// ────────────────────────────────────────────────────────────────────────────
// Member
// ────────────────────────────────────────────────────────────────────────────

export async function listMemberSubmissions(userId = mock.currentMember.id): Promise<SubmissionView[]> {
  if (isLive) return real.listMemberSubmissions(userId);
  return mock.getSubmissionViews().filter((s) => s.userId === userId);
}

export async function listMemberApplications(userId = mock.currentMember.id) {
  if (isLive) return real.listMemberApplications(userId);
  return mock.campaignApplications.filter((a) => a.userId === userId);
}

export async function listUserChannels(userId = mock.currentMember.id) {
  if (isLive) return real.listUserChannels(userId);
  return mock.userChannels.filter((channel) => channel.userId === userId);
}

export async function getActivePenalty(userId = mock.currentMember.id): Promise<UserPenalty | undefined> {
  if (isLive) return real.getActivePenalty(userId);
  const at = new Date();
  return mock.userPenalties.find((p) => {
    return p.userId === userId && new Date(p.startsAt) <= at && new Date(p.endsAt) > at;
  });
}

export async function getMemberProfile(userId = mock.currentMember.id) {
  if (isLive) return real.getMemberProfile(userId);

  const submissions = mock.getSubmissionViews().filter((s) => s.userId === userId);
  const applications = mock.campaignApplications.filter((a) => a.userId === userId);
  const at = new Date();
  const activePenalty = mock.userPenalties.find((p) => {
    return p.userId === userId && new Date(p.startsAt) <= at && new Date(p.endsAt) > at;
  });
  const approved = submissions.filter((s) =>
    ["auto_approved", "approved", "fulfillment_pending", "completed"].includes(s.status)
  ).length;

  return {
    user: mock.users.find((u) => u.id === userId) ?? mock.currentMember,
    channels: mock.userChannels.filter((c) => c.userId === userId),
    applications,
    activePenalty,
    stats: {
      totalSubmissions: submissions.length,
      totalApplications: applications.length,
      approvalRate: submissions.length ? Math.round((approved / submissions.length) * 100) : 0,
      preferredChannel: "Threads",
      strongestFormat: "반응형 콘텐츠"
    }
  };
}

export async function checkSubmissionEligibility(
  campaignId: string,
  userId = mock.currentMember.id
): Promise<SubmissionEligibility> {
  if (isLive) return real.checkSubmissionEligibility(campaignId, userId);

  const activePenalty = await getActivePenalty(userId);
  if (activePenalty) {
    return {
      canSubmit: false,
      reason: "penalty",
      message: `패널티로 ${new Date(activePenalty.endsAt).toLocaleDateString("ko-KR")}까지 사용이 제한됩니다.`,
      penalty: activePenalty
    };
  }

  const application = mock.campaignApplications.find(
    (a) => a.campaignId === campaignId && a.userId === userId
  );
  if (!application) return { canSubmit: false, reason: "not_applied", message: "먼저 캠페인에 신청해야 합니다." };
  if (application.status === "applied") return { canSubmit: false, reason: "pending", message: "관리자 선정 후 제출할 수 있습니다." };
  if (application.status === "rejected") return { canSubmit: false, reason: "rejected", message: "선정되지 않았습니다." };
  if (application.status === "cancelled") return { canSubmit: false, reason: "not_applied", message: "취소된 신청입니다." };

  return { canSubmit: true, reason: "selected", message: "선정된 캠페인입니다." };
}

// ────────────────────────────────────────────────────────────────────────────
// Brand
// ────────────────────────────────────────────────────────────────────────────

export async function listBrandCampaigns(brandId = "brand-1"): Promise<CampaignView[]> {
  if (isLive) return real.listBrandCampaigns(brandId === "brand-1" ? undefined : brandId);
  return mock.getCampaignViews().filter((c) => c.brandId === brandId);
}

export async function getBrandCampaignLimitState(brandId = "brand-1") {
  if (isLive) return real.getBrandCampaignLimitState(brandId === "brand-1" ? undefined : brandId);

  const campaigns = await listBrandCampaigns(brandId);
  const activeStatuses: CampaignStatus[] = ["draft", "open", "paused"];
  const activeCount = campaigns.filter((c) => activeStatuses.includes(c.status)).length;
  const plan = brandId === "brand-3" ? "pro" : brandId === "brand-2" ? "standard" : "basic";
  const limits = {
    basic: { activeCampaignLimit: 2, monthlySelectedLimit: 20, label: "Basic", priceLabel: "무료" },
    standard: { activeCampaignLimit: 5, monthlySelectedLimit: 80, label: "Standard", priceLabel: "월 29,000원" },
    pro: { activeCampaignLimit: 15, monthlySelectedLimit: 250, label: "Pro", priceLabel: "월 99,000원" }
  }[plan];
  const selectedThisMonth = campaigns.reduce((sum, campaign) => sum + campaign.selectedCount, 0);

  return {
    activeCount,
    selectedThisMonth,
    plan,
    planLabel: limits.label,
    priceLabel: limits.priceLabel,
    limit: limits.activeCampaignLimit,
    monthlySelectedLimit: limits.monthlySelectedLimit,
    canCreate: activeCount < limits.activeCampaignLimit,
    canSelectMore: selectedThisMonth < limits.monthlySelectedLimit,
    message:
      activeCount < limits.activeCampaignLimit
        ? `${limits.label} · 동시 진행 ${activeCount}/${limits.activeCampaignLimit}개 · 월 선정 ${selectedThisMonth}/${limits.monthlySelectedLimit}명`
        : `${limits.label} 플랜은 동시 진행 캠페인 ${limits.activeCampaignLimit}개까지 등록할 수 있습니다.`
  };
}

export async function getCampaignDraftPresets(brandId = "brand-1"): Promise<CampaignDraftPreset[]> {
  if (isLive) return real.getCampaignDraftPresets(brandId);

  const campaigns = await listBrandCampaigns(brandId);
  return campaigns.map((c) => ({
    sourceCampaignId: c.id,
    title: c.title,
    experienceType: c.experienceType,
    industry: c.industry,
    category: c.category,
    offerTitle: c.offerTitle,
    offerDescription: c.offerDescription,
    offerValueLabel: c.offerValueLabel,
    channels: c.channels,
    keyMessage: c.guideline.keyMessage
  }));
}

export async function cloneCampaignDraft(sourceCampaignId: string): Promise<CampaignDraftPreset | null> {
  const presets = await getCampaignDraftPresets();
  return presets.find((p) => p.sourceCampaignId === sourceCampaignId) ?? null;
}

// ────────────────────────────────────────────────────────────────────────────
// Admin
// ────────────────────────────────────────────────────────────────────────────

export async function listCampaignApplications(campaignId: string): Promise<CampaignApplicationView[]> {
  if (isLive) return real.listCampaignApplications(campaignId);
  return mock.campaignApplications
    .filter((a) => a.campaignId === campaignId)
    .map((application) => {
      const campaign = mock.campaigns.find((c) => c.id === application.campaignId)!;
      const user = mock.users.find((u) => u.id === application.userId)!;
      const userSubmissions = mock.getSubmissionViews().filter((s) => s.userId === user.id);
      const approved = userSubmissions.filter((s) =>
        ["auto_approved", "approved", "fulfillment_pending", "completed"].includes(s.status)
      ).length;
      const at = new Date();
      const activePenalty = mock.userPenalties.find((p) => {
        return p.userId === user.id && new Date(p.startsAt) <= at && new Date(p.endsAt) > at;
      });

      return {
        ...application,
        campaign,
        brand: mock.brands.find((b) => b.id === campaign.brandId)!,
        user,
        channel: mock.userChannels.find(
          (c) => c.userId === user.id && c.channelType === application.channelType
        ),
        approvalRate: userSubmissions.length ? Math.round((approved / userSubmissions.length) * 100) : 0,
        activePenalty,
        fulfillment: mock.fulfillmentInfos.find((f) => f.applicationId === application.id)
      };
    });
}

export async function listBrandCampaignApplications(campaignId: string, brandId = "brand-1") {
  if (isLive) return real.listBrandCampaignApplications(campaignId, brandId === "brand-1" ? await real.getCurrentUserBrandId() ?? "" : brandId);
  const campaign = mock.campaigns.find((c) => c.id === campaignId && c.brandId === brandId);
  if (!campaign) return [];
  return listCampaignApplications(campaignId);
}

export function getFulfillmentForApplication(applicationId: string): FulfillmentInfo | undefined {
  if (isLive) return undefined;
  return mock.fulfillmentInfos.find((f) => f.applicationId === applicationId);
}

export async function getCampaignApplicationSummary(campaignId: string) {
  const applications = await listCampaignApplications(campaignId);
  return {
    applications,
    applied: applications.filter((a) => a.status === "applied").length,
    selected: applications.filter((a) => a.status === "selected").length,
    rejected: applications.filter((a) => a.status === "rejected").length
  };
}

export async function listAdminSubmissions(status?: SubmissionStatus | "all"): Promise<SubmissionView[]> {
  if (isLive) return real.listAdminSubmissions(status);
  const views = mock.getSubmissionViews();
  return !status || status === "all" ? views : views.filter((s) => s.status === status);
}

export async function getAdminSummary() {
  if (isLive) return real.getAdminSummary();

  const campaigns = mock.getCampaignViews();
  const submissions = mock.getSubmissionViews();
  const today = new Date().toISOString().slice(0, 10);
  const todaySubmissions = submissions.filter((s) => s.submittedAt.startsWith(today)).length;
  const approved = submissions.filter((s) =>
    ["auto_approved", "approved", "fulfillment_pending", "completed"].includes(s.status)
  ).length;

  return {
    admin: mock.currentAdmin,
    activeCampaigns: campaigns.filter((c) => c.status === "open").length,
    todaySubmissions,
    approvalRate: Math.round((approved / submissions.length) * 100),
    autoApproved: submissions.filter((s) => s.status === "auto_approved").length,
    needsReview: submissions.filter((s) => s.status === "needs_review").length,
    applicationPending: mock.campaignApplications.filter((a) => a.status === "applied").length,
    recentSubmissions: submissions.slice(0, 6),
    recentCampaigns: campaigns.slice(0, 5)
  };
}

export function getDefaultAnalyticsFilters(input?: Partial<AnalyticsFilters>): AnalyticsFilters {
  return {
    days: input?.days ?? 7,
    role: input?.role ?? "all",
    channel: input?.channel ?? "all",
    campaignId: input?.campaignId ?? "all"
  };
}

export async function getAnalyticsDashboardData(filters: AnalyticsFilters): Promise<AnalyticsDashboardData> {
  if (isLive) return getLiveAnalyticsDashboardData(filters);
  return buildMockAnalyticsDashboard(filters);
}

export function getAnalyticsErrorMessage(error: unknown) {
  if (isLive) return getLiveAnalyticsErrorMessage(error);
  return error instanceof Error ? error.message : "분석 데이터를 불러오지 못했습니다.";
}

// ────────────────────────────────────────────────────────────────────────────
// Shared helpers (mode 무관)
// ────────────────────────────────────────────────────────────────────────────

export function getApplicationCta(status?: ApplicationStatus, hasPenalty = false) {
  if (hasPenalty) return { label: "사용 제한 중", href: "/member/profile", disabled: true };
  if (!status) return { label: "신청하기", href: "", disabled: false };
  if (status === "selected") return { label: "제출하기", href: "", disabled: false };
  if (status === "applied") return { label: "신청 검토 중", href: "/member/profile", disabled: true };
  if (status === "rejected") return { label: "선정되지 않음", href: "/member/profile", disabled: true };
  return { label: "신청 취소됨", href: "/member/profile", disabled: true };
}

export function getSubmissionChecklist(channelType: ChannelType): SubmissionChecklistItem[] {
  return real.getSubmissionChecklist(channelType);
}
