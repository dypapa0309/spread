import { cookies, headers } from "next/headers";
import { createAdminClient } from "@/supabase/admin";
import { createClient } from "@/supabase/server";
import type {
  AnalyticsActivityFeedRow,
  AnalyticsBottleneckCampaignRow,
  AnalyticsConversionSummary,
  AnalyticsDashboardData,
  AnalyticsDropoffCampaignRow,
  AnalyticsEventName,
  AnalyticsEventPayload,
  AnalyticsFilters,
  AnalyticsFunnelStep,
  AnalyticsKpiSummary,
  AnalyticsRetentionPoint,
  AnalyticsTimeToActionSummary,
  AnalyticsTimeSeriesPoint,
  AnalyticsTopCampaignRow,
  AnalyticsTopPageRow,
  AnalyticsUserActivityRow,
  ChannelType,
  UserRole
} from "@/types/spread";
import type {
  AnalyticsEventRow,
  AnalyticsSessionRow,
  AnalyticsVisitorRow,
  CampaignApplicationRow,
  SubmissionRow
} from "@/supabase/database.types";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

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

function parseBrowser(userAgent: string) {
  if (userAgent.includes("Edg/")) return "Edge";
  if (userAgent.includes("Chrome/")) return "Chrome";
  if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) return "Safari";
  if (userAgent.includes("Firefox/")) return "Firefox";
  return "Unknown";
}

function parseOs(userAgent: string) {
  if (userAgent.includes("Mac OS X")) return "macOS";
  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS";
  return "Unknown";
}

function parseDeviceType(userAgent: string) {
  if (/iPhone|Android.+Mobile/.test(userAgent)) return "mobile";
  if (/iPad|Tablet|Android/.test(userAgent)) return "tablet";
  return "desktop";
}

function normalizeRoutePattern(path: string) {
  const cleaned = path.split("?")[0] || "/";
  return cleaned
    .split("/")
    .map((segment) => {
      if (!segment) return "";
      if (/^[0-9]+$/.test(segment)) return "[id]";
      if (/^[0-9a-f]{8,}$/i.test(segment.replace(/-/g, ""))) return "[id]";
      return segment;
    })
    .join("/") || "/";
}

function safeErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "알 수 없는 오류";
}

async function getCurrentAuthContext() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: undefined, userRole: undefined as UserRole | undefined };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: profile?.id ?? user.id,
    userRole: profile?.role ?? undefined
  };
}

async function upsertVisitor(admin: ReturnType<typeof createAdminClient>, input: {
  visitorId: string;
  userId?: string;
  path: string;
  referrer?: string;
  occurredAt: string;
}) {
  const { data: existing } = await admin
    .from("analytics_visitors")
    .select("*")
    .eq("visitor_id", input.visitorId)
    .maybeSingle();

  const payload = existing
    ? {
        user_id: existing.user_id ?? input.userId ?? null,
        last_seen_at: input.occurredAt,
        updated_at: input.occurredAt
      }
    : {
        visitor_id: input.visitorId,
        user_id: input.userId ?? null,
        first_seen_at: input.occurredAt,
        last_seen_at: input.occurredAt,
        first_referrer: input.referrer ?? null,
        first_landing_path: input.path,
        updated_at: input.occurredAt
      };

  if (existing?.id) {
    await admin.from("analytics_visitors").update(payload).eq("id", existing.id);
    return existing.id;
  }

  const { data: inserted, error } = await admin
    .from("analytics_visitors")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw error;
  return inserted.id;
}

async function upsertSession(admin: ReturnType<typeof createAdminClient>, input: {
  sessionId: string;
  visitorId: string;
  userId?: string;
  path: string;
  referrer?: string;
  occurredAt: string;
  userAgent: string;
}) {
  const { data: existing } = await admin
    .from("analytics_sessions")
    .select("*")
    .eq("session_id", input.sessionId)
    .maybeSingle();

  const payload = existing
    ? {
        user_id: existing.user_id ?? input.userId ?? null,
        ended_at: input.occurredAt,
        updated_at: input.occurredAt
      }
    : {
        session_id: input.sessionId,
        visitor_id: input.visitorId,
        user_id: input.userId ?? null,
        started_at: input.occurredAt,
        ended_at: input.occurredAt,
        landing_path: input.path,
        referrer: input.referrer ?? null,
        device_type: parseDeviceType(input.userAgent),
        browser: parseBrowser(input.userAgent),
        os: parseOs(input.userAgent),
        updated_at: input.occurredAt
      };

  if (existing?.id) {
    await admin.from("analytics_sessions").update(payload).eq("id", existing.id);
    return existing.id;
  }

  const { data: inserted, error } = await admin
    .from("analytics_sessions")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw error;
  return inserted.id;
}

export async function trackAnalyticsEvent(payload: AnalyticsEventPayload) {
  const admin = createAdminClient();
  const auth = await getCurrentAuthContext();
  const headerStore = await headers();
  const occurredAt = payload.occurredAt ?? new Date().toISOString();
  const userAgent = headerStore.get("user-agent") ?? "";

  await upsertVisitor(admin, {
    visitorId: payload.visitorId,
    userId: auth.userId,
    path: payload.path,
    referrer: payload.referrer,
    occurredAt
  });

  await upsertSession(admin, {
    sessionId: payload.sessionId,
    visitorId: payload.visitorId,
    userId: auth.userId,
    path: payload.path,
    referrer: payload.referrer,
    occurredAt,
    userAgent
  });

  const { error } = await admin.from("analytics_events").insert({
    event_name: payload.eventName,
    visitor_id: payload.visitorId,
    session_id: payload.sessionId,
    user_id: auth.userId ?? null,
    user_role: payload.userRole ?? auth.userRole ?? null,
    path: payload.path,
    route_pattern: payload.routePattern ?? normalizeRoutePattern(payload.path),
    referrer: payload.referrer ?? null,
    campaign_id: payload.campaignId ?? null,
    channel_type: payload.channelType ?? null,
    metadata: payload.metadata ?? {},
    occurred_at: occurredAt
  });

  if (error) throw error;
}

export async function trackServerAnalyticsEvent(input: {
  eventName: AnalyticsEventName;
  path: string;
  campaignId?: string;
  channelType?: ChannelType;
  userId?: string;
  userRole?: UserRole;
  metadata?: Record<string, unknown>;
}) {
  const cookieStore = await cookies();
  const visitorId = cookieStore.get("spread_visitor_id")?.value ?? `server-${crypto.randomUUID()}`;
  const sessionId = cookieStore.get("spread_session_id")?.value ?? `server-${crypto.randomUUID()}`;

  await trackAnalyticsEvent({
    eventName: input.eventName,
    visitorId,
    sessionId,
    path: input.path,
    campaignId: input.campaignId,
    channelType: input.channelType,
    userRole: input.userRole,
    metadata: input.metadata
  });
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

function matchesRoleFilter(role: UserRole | undefined, filter: AnalyticsFilters["role"]) {
  if (!filter || filter === "all") return true;
  return role === filter;
}

function matchesChannelFilter(channelType: ChannelType | undefined, filter: AnalyticsFilters["channel"]) {
  if (!filter || filter === "all") return true;
  return channelType === filter;
}

function matchesCampaignFilter(campaignId: string | undefined, filter: AnalyticsFilters["campaignId"]) {
  if (!filter || filter === "all") return true;
  return campaignId === filter;
}

function filterEvents(events: AnalyticsEventRow[], filters: AnalyticsFilters) {
  const start = addDays(startOfDay(new Date()), -(filters.days - 1));
  return events.filter((event) =>
    withinRange(event.occurred_at, start) &&
    matchesRoleFilter(event.user_role ?? undefined, filters.role) &&
    matchesChannelFilter(event.channel_type ?? undefined, filters.channel) &&
    matchesCampaignFilter(event.campaign_id ?? undefined, filters.campaignId)
  );
}

function buildSummary(events: AnalyticsEventRow[], visitors: AnalyticsVisitorRow[], sessions: AnalyticsSessionRow[], usersCreatedAt: string[]): AnalyticsKpiSummary {
  const today = startOfDay(new Date());
  const last7 = addDays(today, -6);
  const last30 = addDays(today, -29);

  const pageViewsToday = events.filter((event) => event.event_name === "page_view" && withinRange(event.occurred_at, today)).length;
  const visitorsToday = new Set(visitors.filter((visitor) => withinRange(visitor.last_seen_at, today)).map((visitor) => visitor.visitor_id)).size;
  const sessionsToday = new Set(sessions.filter((session) => withinRange(session.started_at, today)).map((session) => session.session_id)).size;
  const signUpsToday = usersCreatedAt.filter((createdAt) => withinRange(createdAt, today)).length;
  const signUps7d = usersCreatedAt.filter((createdAt) => withinRange(createdAt, last7)).length;
  const signUps30d = usersCreatedAt.filter((createdAt) => withinRange(createdAt, last30)).length;

  const userEvents7d = events.filter((event) => event.user_id && withinRange(event.occurred_at, last7));
  const userEvents30d = events.filter((event) => event.user_id && withinRange(event.occurred_at, last30));
  const userEvents1d = events.filter((event) => event.user_id && withinRange(event.occurred_at, today));
  const pageViews = events.filter((event) => event.event_name === "page_view");
  const applications = events.filter((event) => event.event_name === "campaign_applied");
  const submissions = events.filter((event) => event.event_name === "submission_completed");

  return {
    totalUsers: usersCreatedAt.length,
    newUsersToday: signUpsToday,
    newUsers7d: signUps7d,
    newUsers30d: signUps30d,
    visitorsToday,
    sessionsToday,
    pageViewsToday,
    dau: new Set(userEvents1d.map((event) => event.user_id)).size,
    wau: new Set(userEvents7d.map((event) => event.user_id)).size,
    mau: new Set(userEvents30d.map((event) => event.user_id)).size,
    activeUsers7d: new Set(userEvents7d.map((event) => event.user_id)).size,
    applicationConversionRate: asPercent(applications.length, pageViews.length),
    submissionConversionRate: asPercent(submissions.length, applications.length)
  };
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

function isProcessedStatus(status: SubmissionRow["status"]) {
  return ["approved", "fulfillment_pending", "completed"].includes(status);
}

function buildConversionSummary(
  events: AnalyticsEventRow[],
  applications: CampaignApplicationRow[],
  submissions: SubmissionRow[]
): AnalyticsConversionSummary {
  const views = events.filter((event) => event.event_name === "campaign_viewed").length;
  const applicationCount = applications.length;
  const selectedCount = applications.filter((application) => application.status === "selected").length;
  const submissionStartedCount = events.filter((event) => event.event_name === "submission_started").length;
  const submissionCompletedCount = submissions.length;
  const processedCount = submissions.filter((submission) => isProcessedStatus(submission.status)).length;

  return {
    viewToApplyRate: asPercent(applicationCount, views),
    applyToSelectedRate: asPercent(selectedCount, applicationCount),
    selectedToSubmissionStartedRate: asPercent(submissionStartedCount, selectedCount),
    submissionStartedToCompletedRate: asPercent(submissionCompletedCount, submissionStartedCount),
    submissionCompletedToProcessedRate: asPercent(processedCount, submissionCompletedCount),
    views,
    applications: applicationCount,
    selected: selectedCount,
    submissionStarted: submissionStartedCount,
    submissionCompleted: submissionCompletedCount,
    processed: processedCount
  };
}

function buildTimeToActionSummary(
  events: AnalyticsEventRow[],
  applications: CampaignApplicationRow[],
  submissions: SubmissionRow[]
): AnalyticsTimeToActionSummary {
  const submissionStartedByKey = new Map(
    events
      .filter((event) => event.event_name === "submission_started" && event.user_id && event.campaign_id && event.channel_type)
      .map((event) => [`${event.campaign_id}:${event.user_id}:${event.channel_type}`, event.occurred_at])
  );

  const submissionByKey = new Map(
    submissions.map((submission) => [`${submission.campaign_id}:${submission.user_id}:${submission.channel_type}`, submission])
  );

  const applyToSelected = applications
    .map((application) => diffHours(application.applied_at, application.decided_at))
    .filter((value): value is number => value !== undefined);

  const selectedToSubmissionStarted = applications
    .filter((application) => application.status === "selected")
    .map((application) => {
      const startedAt = submissionStartedByKey.get(`${application.campaign_id}:${application.user_id}:${application.channel_type}`);
      return diffHours(application.decided_at, startedAt);
    })
    .filter((value): value is number => value !== undefined);

  const submissionStartedToCompleted = submissions
    .map((submission) => {
      const startedAt = submissionStartedByKey.get(`${submission.campaign_id}:${submission.user_id}:${submission.channel_type}`);
      return diffHours(startedAt, submission.submitted_at);
    })
    .filter((value): value is number => value !== undefined);

  const submissionCompletedToProcessed = submissions
    .filter((submission) => isProcessedStatus(submission.status))
    .map((submission) => diffHours(submission.submitted_at, submission.reviewed_at))
    .filter((value): value is number => value !== undefined);

  return {
    applyToSelectedHours: averageHours(applyToSelected),
    selectedToSubmissionStartedHours: averageHours(selectedToSubmissionStarted),
    submissionStartedToCompletedHours: averageHours(submissionStartedToCompleted),
    submissionCompletedToProcessedHours: averageHours(submissionCompletedToProcessed)
  };
}

function buildTimeSeries(events: AnalyticsEventRow[], usersCreatedAt: string[], days: number): AnalyticsTimeSeriesPoint[] {
  const buckets = buildDateBuckets(days);
  return buckets.map((date) => {
    const dayEvents = events.filter((event) => event.occurred_at.slice(0, 10) === date);
    return {
      date,
      visitors: new Set(dayEvents.map((event) => event.visitor_id)).size,
      sessions: new Set(dayEvents.map((event) => event.session_id)).size,
      pageViews: dayEvents.filter((event) => event.event_name === "page_view").length,
      signUps: usersCreatedAt.filter((createdAt) => createdAt.slice(0, 10) === date).length,
      applications: dayEvents.filter((event) => event.event_name === "campaign_applied").length,
      selected: dayEvents.filter((event) => event.event_name === "application_selected").length,
      submissions: dayEvents.filter((event) => event.event_name === "submission_completed").length
    };
  });
}

function buildFunnel(events: AnalyticsEventRow[]): AnalyticsFunnelStep[] {
  const steps = [
    { key: "visit", label: "방문", count: new Set(events.filter((event) => event.event_name === "page_view").map((event) => event.visitor_id)).size },
    { key: "signup", label: "가입", count: events.filter((event) => event.event_name === "sign_up_completed").length },
    { key: "campaign_view", label: "캠페인 조회", count: events.filter((event) => event.event_name === "campaign_viewed").length },
    { key: "apply", label: "신청", count: events.filter((event) => event.event_name === "campaign_applied").length },
    { key: "selected", label: "선정", count: events.filter((event) => event.event_name === "application_selected").length },
    { key: "submit", label: "제출 완료", count: events.filter((event) => event.event_name === "submission_completed").length }
  ];

  return steps.map((step, index) => ({
    ...step,
    conversionFromPrevious: index === 0 ? undefined : asPercent(step.count, steps[index - 1].count)
  }));
}

function buildTopPages(events: AnalyticsEventRow[]): AnalyticsTopPageRow[] {
  const pageViews = events.filter((event) => event.event_name === "page_view");
  const map = new Map<string, { routePattern: string; views: number; visitors: Set<string> }>();

  pageViews.forEach((event) => {
    const key = event.path;
    const current = map.get(key) ?? { routePattern: event.route_pattern ?? normalizeRoutePattern(event.path), views: 0, visitors: new Set<string>() };
    current.views += 1;
    current.visitors.add(event.visitor_id);
    map.set(key, current);
  });

  return Array.from(map.entries())
    .map(([path, value]) => ({
      path,
      routePattern: value.routePattern,
      views: value.views,
      uniqueVisitors: value.visitors.size,
      avgViewsPerVisitor: value.visitors.size ? Math.round((value.views / value.visitors.size) * 10) / 10 : 0
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
}

function buildChannelActivity(events: AnalyticsEventRow[]) {
  const channels: ChannelType[] = ["threads", "x", "wordpress", "kakao"];
  return channels.map((channelType) => ({
    channelType,
    pageViews: events.filter((event) => {
      if (event.event_name !== "campaign_viewed") return false;
      if (event.channel_type === channelType) return true;
      const metadata = (event.metadata ?? {}) as { channels?: string[] };
      return Array.isArray(metadata.channels) && metadata.channels.includes(channelType);
    }).length,
    applications: events.filter((event) => event.event_name === "campaign_applied" && event.channel_type === channelType).length,
    submissions: events.filter((event) => event.event_name === "submission_completed" && event.channel_type === channelType).length
  }));
}

function buildRetention(users: { id: string; created_at: string; nickname: string; role: UserRole }[], events: AnalyticsEventRow[]): AnalyticsRetentionPoint[] {
  const cohorts = new Map<string, { users: string[] }>();

  users.forEach((user) => {
    const date = user.created_at.slice(0, 10);
    const current = cohorts.get(date) ?? { users: [] };
    current.users.push(user.id);
    cohorts.set(date, current);
  });

  return Array.from(cohorts.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 8)
    .map(([cohortDate, cohort]) => {
      const cohortDateTime = new Date(`${cohortDate}T00:00:00.000Z`);
      const memberEvents = events.filter((event) => event.user_id && cohort.users.includes(event.user_id));
      const returningUsers = (offsetStart: number, offsetEnd: number) =>
        new Set(
          memberEvents
            .filter((event) => {
              const diffDays = Math.floor((new Date(event.occurred_at).getTime() - cohortDateTime.getTime()) / (24 * 60 * 60 * 1000));
              return diffDays >= offsetStart && diffDays <= offsetEnd;
            })
            .map((event) => event.user_id)
        ).size;

      return {
        cohortDate,
        cohortSize: cohort.users.length,
        day1Rate: asPercent(returningUsers(1, 1), cohort.users.length),
        day7Rate: asPercent(returningUsers(7, 7), cohort.users.length),
        day30Rate: asPercent(returningUsers(30, 30), cohort.users.length)
      };
    });
}

function buildActivityFeed(events: AnalyticsEventRow[], users: { id: string; nickname: string; role: UserRole }[]): AnalyticsActivityFeedRow[] {
  const userMap = new Map(users.map((user) => [user.id, user]));
  const eventLabels: Record<AnalyticsEventName, string> = {
    page_view: "페이지 조회",
    sign_up_completed: "회원가입 완료",
    login_completed: "로그인 완료",
    campaign_viewed: "캠페인 조회",
    campaign_applied: "캠페인 신청",
    application_selected: "신청 선정",
    submission_started: "제출 시작",
    submission_completed: "제출 완료",
    channel_saved: "채널 저장"
  };

  return [...events]
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
    .slice(0, 20)
    .map((event) => ({
      id: event.id,
      occurredAt: event.occurred_at,
      eventName: event.event_name,
      label: eventLabels[event.event_name],
      path: event.path,
      nickname: event.user_id ? userMap.get(event.user_id)?.nickname : undefined,
      userRole: event.user_role ?? undefined
    }));
}

function buildActiveUsers(events: AnalyticsEventRow[], users: { id: string; nickname: string; role: UserRole }[]): AnalyticsUserActivityRow[] {
  const start = addDays(startOfDay(new Date()), -6);
  const relevant = events.filter((event) => event.user_id && withinRange(event.occurred_at, start));
  const grouped = new Map<string, AnalyticsEventRow[]>();
  relevant.forEach((event) => {
    const key = event.user_id as string;
    grouped.set(key, [...(grouped.get(key) ?? []), event]);
  });

  return Array.from(grouped.entries())
    .map(([userId, userEvents]) => {
      const user = users.find((item) => item.id === userId);
      const latest = [...userEvents].sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())[0];
      const labels: Record<AnalyticsEventName, string> = {
        page_view: "페이지 조회",
        sign_up_completed: "회원가입 완료",
        login_completed: "로그인 완료",
        campaign_viewed: "캠페인 조회",
        campaign_applied: "신청",
        application_selected: "선정",
        submission_started: "제출 시작",
        submission_completed: "제출 완료",
        channel_saved: "채널 저장"
      };
      return {
        userId,
        nickname: user?.nickname ?? "알 수 없음",
        role: user?.role ?? "member",
        lastSeenAt: latest.occurred_at,
        pageViews: userEvents.filter((event) => event.event_name === "page_view").length,
        applications: userEvents.filter((event) => event.event_name === "campaign_applied").length,
        submissions: userEvents.filter((event) => event.event_name === "submission_completed").length,
        lastActionLabel: labels[latest.event_name]
      };
    })
    .sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime())
    .slice(0, 12);
}

function buildTopCampaigns(
  events: AnalyticsEventRow[],
  campaigns: { id: string; title: string; brandName: string }[],
  applications: CampaignApplicationRow[],
  submissions: SubmissionRow[]
): AnalyticsTopCampaignRow[] {
  const grouped = new Map<string, {
    views: number;
    applications: number;
    selected: number;
    submissionStarted: number;
    submissions: number;
    processed: number;
  }>();

  events.forEach((event) => {
    if (!event.campaign_id) return;
    const current = grouped.get(event.campaign_id) ?? {
      views: 0,
      applications: 0,
      selected: 0,
      submissionStarted: 0,
      submissions: 0,
      processed: 0
    };
    if (event.event_name === "campaign_viewed") current.views += 1;
    if (event.event_name === "submission_started") current.submissionStarted += 1;
    grouped.set(event.campaign_id, current);
  });

  applications.forEach((application) => {
    const current = grouped.get(application.campaign_id) ?? {
      views: 0,
      applications: 0,
      selected: 0,
      submissionStarted: 0,
      submissions: 0,
      processed: 0
    };
    current.applications += 1;
    if (application.status === "selected") current.selected += 1;
    grouped.set(application.campaign_id, current);
  });

  submissions.forEach((submission) => {
    const current = grouped.get(submission.campaign_id) ?? {
      views: 0,
      applications: 0,
      selected: 0,
      submissionStarted: 0,
      submissions: 0,
      processed: 0
    };
    current.submissions += 1;
    if (isProcessedStatus(submission.status)) current.processed += 1;
    grouped.set(submission.campaign_id, current);
  });

  return Array.from(grouped.entries())
    .map(([campaignId, value]) => {
      const campaign = campaigns.find((item) => item.id === campaignId);
      return {
        campaignId,
        campaignTitle: campaign?.title ?? "삭제된 캠페인",
        brandName: campaign?.brandName ?? "-",
        views: value.views,
        applications: value.applications,
        selected: value.selected,
        submissionStarted: value.submissionStarted,
        submissions: value.submissions,
        processed: value.processed,
        applicationConversionRate: asPercent(value.applications, value.views),
        selectionConversionRate: asPercent(value.selected, value.applications),
        submissionStartConversionRate: asPercent(value.submissionStarted, value.selected),
        submissionConversionRate: asPercent(value.submissions, value.applications),
        processedConversionRate: asPercent(value.processed, value.submissions)
      };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
}

function buildDropoffCampaigns(topCampaigns: AnalyticsTopCampaignRow[]): AnalyticsDropoffCampaignRow[] {
  return topCampaigns
    .filter((campaign) => campaign.views > 0 || campaign.applications > 0)
    .map((campaign) => {
      const viewToApplyGap = 100 - campaign.applicationConversionRate;
      const applyToSubmissionRate = asPercent(campaign.submissions, campaign.applications);
      const applyToSubmissionGap = 100 - applyToSubmissionRate;
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
        primaryDropoff: (viewToApplyGap >= applyToSubmissionGap ? "view_to_apply" : "apply_to_submission") as "view_to_apply" | "apply_to_submission"
      };
    })
    .sort((a, b) => {
      const aScore = a.primaryDropoff === "view_to_apply" ? a.viewToApplyRate : a.applyToSubmissionRate;
      const bScore = b.primaryDropoff === "view_to_apply" ? b.viewToApplyRate : b.applyToSubmissionRate;
      return aScore - bScore;
    })
    .slice(0, 6);
}

function buildBottleneckCampaigns(
  campaigns: { id: string; title: string; brandName: string }[],
  applications: CampaignApplicationRow[],
  submissions: SubmissionRow[],
  events: AnalyticsEventRow[]
): AnalyticsBottleneckCampaignRow[] {
  const submissionStartedByKey = new Map(
    events
      .filter((event) => event.event_name === "submission_started" && event.user_id && event.campaign_id && event.channel_type)
      .map((event) => [`${event.campaign_id}:${event.user_id}:${event.channel_type}`, event.occurred_at])
  );

  return campaigns
    .map((campaign) => {
      const campaignApplications = applications.filter((application) => application.campaign_id === campaign.id);
      const campaignSubmissions = submissions.filter((submission) => submission.campaign_id === campaign.id);
      const applyToSelected = averageHours(
        campaignApplications
          .map((application) => diffHours(application.applied_at, application.decided_at))
          .filter((value): value is number => value !== undefined)
      );
      const selectedToSubmissionStarted = averageHours(
        campaignApplications
          .filter((application) => application.status === "selected")
          .map((application) =>
            diffHours(
              application.decided_at,
              submissionStartedByKey.get(`${application.campaign_id}:${application.user_id}:${application.channel_type}`)
            )
          )
          .filter((value): value is number => value !== undefined)
      );
      const submissionCompletedToProcessed = averageHours(
        campaignSubmissions
          .filter((submission) => isProcessedStatus(submission.status))
          .map((submission) => diffHours(submission.submitted_at, submission.reviewed_at))
          .filter((value): value is number => value !== undefined)
      );
      return {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        brandName: campaign.brandName,
        applyToSelectedHours: applyToSelected,
        selectedToSubmissionStartedHours: selectedToSubmissionStarted,
        submissionCompletedToProcessedHours: submissionCompletedToProcessed
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
}

async function requireAdminAccess() {
  const { userId, userRole } = await getCurrentAuthContext();
  if (!userId || userRole !== "admin") {
    throw new Error("관리자만 접근할 수 있습니다.");
  }
}

async function fetchAnalyticsBaseData(filters: AnalyticsFilters) {
  await requireAdminAccess();

  const admin = createAdminClient();
  const start = addDays(startOfDay(new Date()), -(Math.max(filters.days, 30) - 1)).toISOString();

  const [visitorsResult, sessionsResult, eventsResult, usersResult, campaignsResult, applicationsResult, submissionsResult] = await Promise.all([
    admin.from("analytics_visitors").select("*").gte("last_seen_at", start),
    admin.from("analytics_sessions").select("*").gte("started_at", start),
    admin.from("analytics_events").select("*").gte("occurred_at", start).order("occurred_at", { ascending: false }),
    admin.from("users").select("id, nickname, role, created_at"),
    admin
      .from("campaigns")
      .select("id, title, brands!brand_id(name)")
      .order("created_at", { ascending: false }),
    admin.from("campaign_applications").select("*").gte("applied_at", start),
    admin.from("submissions").select("*").gte("submitted_at", start)
  ]);

  const firstError =
    visitorsResult.error ??
    sessionsResult.error ??
    eventsResult.error ??
    usersResult.error ??
    campaignsResult.error ??
    applicationsResult.error ??
    submissionsResult.error;
  if (firstError) {
    throw new Error(firstError.message);
  }

  const visitors = visitorsResult.data;
  const sessions = sessionsResult.data;
  const events = eventsResult.data;
  const users = usersResult.data;
  const campaigns = campaignsResult.data;
  const applications = applicationsResult.data;
  const submissions = submissionsResult.data;

  const filteredEvents = filterEvents((events ?? []) as AnalyticsEventRow[], filters);
  const filteredApplications = ((applications ?? []) as CampaignApplicationRow[]).filter((application) =>
    matchesChannelFilter(application.channel_type, filters.channel) &&
    matchesCampaignFilter(application.campaign_id, filters.campaignId)
  );
  const filteredSubmissions = ((submissions ?? []) as SubmissionRow[]).filter((submission) =>
    matchesChannelFilter(submission.channel_type, filters.channel) &&
    matchesCampaignFilter(submission.campaign_id, filters.campaignId)
  );

  return {
    visitors: (visitors ?? []) as AnalyticsVisitorRow[],
    sessions: (sessions ?? []) as AnalyticsSessionRow[],
    events: filteredEvents,
    applications: filteredApplications,
    submissions: filteredSubmissions,
    users: ((users ?? []) as { id: string; nickname: string; role: UserRole; created_at: string }[]),
    campaigns: ((campaigns ?? []) as { id: string; title: string; brands: { name: string } | { name: string }[] | null }[]).map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      brandName: Array.isArray(campaign.brands) ? campaign.brands[0]?.name ?? "-" : campaign.brands?.name ?? "-"
    }))
  };
}

export async function getAnalyticsSummary(filters: AnalyticsFilters) {
  const data = await fetchAnalyticsBaseData(filters);
  return buildSummary(data.events, data.visitors, data.sessions, data.users.map((user) => user.created_at));
}

export async function getAnalyticsTimeSeries(filters: AnalyticsFilters) {
  const data = await fetchAnalyticsBaseData(filters);
  return buildTimeSeries(data.events, data.users.map((user) => user.created_at), filters.days);
}

export async function getAnalyticsFunnel(filters: AnalyticsFilters) {
  const data = await fetchAnalyticsBaseData(filters);
  return buildFunnel(data.events);
}

export async function getTopCampaignAnalytics(filters: AnalyticsFilters) {
  const data = await fetchAnalyticsBaseData(filters);
  return buildTopCampaigns(data.events, data.campaigns, data.applications, data.submissions);
}

export async function getTopPageAnalytics(filters: AnalyticsFilters) {
  const data = await fetchAnalyticsBaseData(filters);
  return buildTopPages(data.events);
}

export async function getRecentActivityFeed(limit = 20, filters: AnalyticsFilters) {
  const data = await fetchAnalyticsBaseData(filters);
  return buildActivityFeed(data.events, data.users).slice(0, limit);
}

export async function getAnalyticsDashboardData(filters: AnalyticsFilters): Promise<AnalyticsDashboardData> {
  const data = await fetchAnalyticsBaseData(filters);
  const topCampaigns = buildTopCampaigns(data.events, data.campaigns, data.applications, data.submissions);

  return {
    filters,
    summary: buildSummary(data.events, data.visitors, data.sessions, data.users.map((user) => user.created_at)),
    conversionSummary: buildConversionSummary(data.events, data.applications, data.submissions),
    timeToActionSummary: buildTimeToActionSummary(data.events, data.applications, data.submissions),
    timeSeries: buildTimeSeries(data.events, data.users.map((user) => user.created_at), filters.days),
    funnel: buildFunnel(data.events),
    topCampaigns,
    dropoffCampaigns: buildDropoffCampaigns(topCampaigns),
    bottleneckCampaigns: buildBottleneckCampaigns(data.campaigns, data.applications, data.submissions, data.events),
    topPages: buildTopPages(data.events),
    channelActivity: buildChannelActivity(data.events),
    activeUsers: buildActiveUsers(data.events, data.users),
    recentActivity: buildActivityFeed(data.events, data.users),
    retention: buildRetention(data.users, data.events),
    campaigns: data.campaigns.map((campaign) => ({ id: campaign.id, title: campaign.title }))
  };
}

export async function resolveVisitorContext() {
  const cookieStore = await cookies();
  return {
    visitorId: cookieStore.get("spread_visitor_id")?.value,
    sessionId: cookieStore.get("spread_session_id")?.value
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

export function getAnalyticsErrorMessage(error: unknown) {
  return safeErrorMessage(error);
}
