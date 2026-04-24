import type { ReactNode } from "react";
import { channelLabels } from "@/lib/labels";
import type { AnalyticsDashboardData, AnalyticsTimeSeriesPoint, UserRole } from "@/types/spread";
import { Badge } from "@/components/ui/badge";
import { LinkButton, Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/field";

const roleLabels: Record<"all" | UserRole, string> = {
  all: "전체 역할",
  member: "사용자",
  brand: "광고주",
  admin: "운영자"
};

function number(value: number) {
  return value.toLocaleString("ko-KR");
}

function shortDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(new Date(value));
}

export function AnalyticsDashboard({
  data,
  setupMessage
}: {
  data: AnalyticsDashboardData;
  setupMessage?: string;
}) {
  const totalPageViews = sum(data.timeSeries, "pageViews");
  const totalApplications = sum(data.timeSeries, "applications");
  const totalSubmissions = sum(data.timeSeries, "submissions");

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-4xl">
          <p className="text-sm font-black text-spread-point">Analytics</p>
          <h1 className="mt-2 text-4xl font-black leading-tight">서비스 분석</h1>
          <p className="mt-3 text-sm leading-6 text-spread-ink/65">
            가입, 방문, 활성, 신청, 제출 흐름을 SPREAD 내부 이벤트 기준으로 확인합니다. 원본 이벤트는 12개월 보관 기준으로 운영합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/admin" variant="outline">운영 큐 보기</LinkButton>
          <LinkButton href="/admin/campaigns" variant="outline">캠페인 관리</LinkButton>
        </div>
      </div>

      <Card className="grid gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-spread-ink/50">Filters</p>
            <h2 className="mt-2 text-xl font-black">조회 조건</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{roleLabels[data.filters.role ?? "all"]}</Badge>
            <Badge>{data.filters.channel === "all" || !data.filters.channel ? "전체 채널" : channelLabels[data.filters.channel]}</Badge>
            <Badge>{data.filters.days}일 기준</Badge>
          </div>
        </div>
        <form className="grid gap-3 rounded-2xl border border-spread-ink/10 bg-spread-ink/[0.02] p-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end" method="get">
          <Field label="기간">
            <Select name="days" defaultValue={String(data.filters.days)}>
              <option value="1">오늘</option>
              <option value="7">7일</option>
              <option value="30">30일</option>
              <option value="90">90일</option>
            </Select>
          </Field>
          <Field label="역할">
            <Select name="role" defaultValue={data.filters.role}>
              <option value="all">전체</option>
              <option value="member">사용자</option>
              <option value="brand">광고주</option>
              <option value="admin">운영자</option>
            </Select>
          </Field>
          <Field label="채널">
            <Select name="channel" defaultValue={data.filters.channel}>
              <option value="all">전체 채널</option>
              <option value="threads">Threads</option>
              <option value="x">X</option>
              <option value="wordpress">WordPress</option>
              <option value="kakao">KakaoTalk</option>
            </Select>
          </Field>
          <Field label="캠페인">
            <Select name="campaignId" defaultValue={data.filters.campaignId}>
              <option value="all">전체 캠페인</option>
              {data.campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>{campaign.title}</option>
              ))}
            </Select>
          </Field>
          <Button type="submit">적용</Button>
        </form>
        <div className="grid gap-3 rounded-2xl border border-spread-ink/10 bg-spread-bg p-4 md:grid-cols-3">
          <InlineStat label="누적 페이지뷰" value={number(totalPageViews)} />
          <InlineStat label="누적 신청" value={number(totalApplications)} />
          <InlineStat label="누적 제출" value={number(totalSubmissions)} />
        </div>
        {setupMessage ? (
          <div className="rounded-2xl border border-spread-point bg-spread-point/10 p-4 text-sm leading-6 text-spread-ink">
            <p className="font-black text-spread-point">분석 저장소 설정 필요</p>
            <p className="mt-2">{setupMessage}</p>
            <p className="mt-2 text-spread-ink/65">`supabase/analytics-schema.sql`을 적용한 뒤 새로고침하면 실데이터가 표시됩니다.</p>
          </div>
        ) : null}
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="전체 가입자" value={number(data.summary.totalUsers)} sub={`오늘 ${number(data.summary.newUsersToday)} · 30일 ${number(data.summary.newUsers30d)}`} />
        <MetricCard label="오늘 방문" value={number(data.summary.visitorsToday)} sub={`세션 ${number(data.summary.sessionsToday)} · PV ${number(data.summary.pageViewsToday)}`} active />
        <MetricCard label="활성 사용자" value={number(data.summary.activeUsers7d)} sub={`DAU ${number(data.summary.dau)} · WAU ${number(data.summary.wau)} · MAU ${number(data.summary.mau)}`} />
        <MetricCard label="전환율" value={`${data.summary.applicationConversionRate}%`} sub={`신청 → 제출 ${data.summary.submissionConversionRate}%`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="grid gap-5">
          <SectionHeader
            eyebrow="Conversion"
            title="전환 보드"
            caption="방문에서 처리 완료까지 어디서 많이 빠지는지 바로 볼 수 있습니다."
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="조회 → 신청" value={`${data.conversionSummary.viewToApplyRate}%`} sub={`${number(data.conversionSummary.views)}건 중 ${number(data.conversionSummary.applications)}건`} />
            <MetricCard label="신청 → 선정" value={`${data.conversionSummary.applyToSelectedRate}%`} sub={`${number(data.conversionSummary.applications)}건 중 ${number(data.conversionSummary.selected)}건`} />
            <MetricCard label="선정 → 제출 시작" value={`${data.conversionSummary.selectedToSubmissionStartedRate}%`} sub={`${number(data.conversionSummary.selected)}건 중 ${number(data.conversionSummary.submissionStarted)}건`} />
            <MetricCard label="제출 시작 → 제출 완료" value={`${data.conversionSummary.submissionStartedToCompletedRate}%`} sub={`${number(data.conversionSummary.submissionStarted)}건 중 ${number(data.conversionSummary.submissionCompleted)}건`} />
            <MetricCard label="제출 완료 → 처리 완료" value={`${data.conversionSummary.submissionCompletedToProcessedRate}%`} sub={`${number(data.conversionSummary.submissionCompleted)}건 중 ${number(data.conversionSummary.processed)}건`} active />
          </div>
          <div className="grid gap-3 rounded-2xl border border-spread-ink/10 bg-spread-ink/[0.02] p-4 md:grid-cols-5">
            <InlineStat label="조회" value={number(data.conversionSummary.views)} />
            <InlineStat label="신청" value={number(data.conversionSummary.applications)} />
            <InlineStat label="선정" value={number(data.conversionSummary.selected)} />
            <InlineStat label="제출 완료" value={number(data.conversionSummary.submissionCompleted)} />
            <InlineStat label="처리 완료" value={number(data.conversionSummary.processed)} />
          </div>
        </Card>

        <Card className="grid gap-5">
          <SectionHeader
            eyebrow="Speed"
            title="속도 보드"
            caption="운영이 오래 걸리는 구간과 사용자가 늦게 움직이는 구간을 봅니다."
          />
          <div className="grid gap-3 md:grid-cols-2">
            <TimeMetricCard label="신청 → 선정" hours={data.timeToActionSummary.applyToSelectedHours} />
            <TimeMetricCard label="선정 → 제출 시작" hours={data.timeToActionSummary.selectedToSubmissionStartedHours} />
            <TimeMetricCard label="제출 시작 → 제출 완료" hours={data.timeToActionSummary.submissionStartedToCompletedHours} />
            <TimeMetricCard label="제출 완료 → 처리 완료" hours={data.timeToActionSummary.submissionCompletedToProcessedHours} />
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="grid gap-5">
          <SectionHeader
            eyebrow="Trend"
            title="일별 추이"
            caption={`${data.filters.days}일 동안의 페이지뷰와 신청 흐름`}
            trailing={<Badge>{data.filters.days}일</Badge>}
          />
          <MiniBarChart
            points={data.timeSeries}
            primaryKey="pageViews"
            secondaryKey="applications"
            primaryLabel="페이지뷰"
            secondaryLabel="신청"
          />
          <div className="grid gap-3 md:grid-cols-3">
            <TrendStat label="가입" value={number(sum(data.timeSeries, "signUps"))} />
            <TrendStat label="선정" value={number(sum(data.timeSeries, "selected"))} />
            <TrendStat label="제출" value={number(sum(data.timeSeries, "submissions"))} />
          </div>
        </Card>

        <Card className="grid gap-5">
          <SectionHeader eyebrow="Funnel" title="방문 → 제출" caption="단계별 이탈 구간을 한 번에 봅니다." />
          <div className="grid gap-3">
            {data.funnel.map((step) => (
              <div key={step.key} className="grid gap-2 rounded-2xl border border-spread-ink/10 bg-spread-ink/[0.02] p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-black">{step.label}</span>
                    {step.conversionFromPrevious !== undefined ? (
                      <span className="text-xs text-spread-ink/50">이전 대비 {step.conversionFromPrevious}%</span>
                    ) : null}
                  </div>
                  <span className="font-black">{number(step.count)}</span>
                </div>
                <div className="h-2 rounded-full bg-spread-ink/8">
                  <div
                    className="h-2 rounded-full bg-spread-point"
                    style={{ width: `${Math.max(10, (step.count / Math.max(data.funnel[0]?.count ?? 1, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="grid gap-5">
          <SectionHeader
            eyebrow="Campaigns"
            title="상위 캠페인"
            caption="조회, 신청, 제출이 동시에 움직이는 캠페인을 찾습니다."
            trailing={<Badge>{data.topCampaigns.length}개</Badge>}
          />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs font-black uppercase text-spread-ink/45">
                <tr>
                  <th className="pb-3 pr-4">캠페인</th>
                  <th className="pb-3 pr-4">조회</th>
                  <th className="pb-3 pr-4">신청</th>
                  <th className="pb-3 pr-4">선정</th>
                  <th className="pb-3 pr-4">제출 완료</th>
                  <th className="pb-3">전환</th>
                </tr>
              </thead>
              <tbody>
                {data.topCampaigns.length ? data.topCampaigns.map((row) => (
                  <tr key={row.campaignId} className="border-t border-spread-ink/8 align-top">
                    <td className="py-3 pr-4 align-top">
                      <p className="font-black">{row.campaignTitle}</p>
                      <p className="mt-1 text-xs text-spread-ink/50">{row.brandName}</p>
                    </td>
                    <td className="py-3 pr-4">{number(row.views)}</td>
                    <td className="py-3 pr-4">{number(row.applications)}</td>
                    <td className="py-3 pr-4">{number(row.selected)}</td>
                    <td className="py-3 pr-4">{number(row.submissions)}</td>
                    <td className="py-3">
                      <div className="grid gap-1 text-xs text-spread-ink/65">
                        <span>조회 → 신청 {row.applicationConversionRate}%</span>
                        <span>신청 → 제출 {row.submissionConversionRate}%</span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-spread-ink/50">표시할 캠페인 데이터가 아직 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="grid gap-5">
          <SectionHeader
            eyebrow="Pages"
            title="상위 페이지"
            caption="어디에서 실제 체류와 재방문이 일어나는지 봅니다."
            trailing={<Badge>{data.topPages.length}개</Badge>}
          />
          <div className="grid gap-3">
            {data.topPages.length ? data.topPages.map((page) => (
              <div key={page.path} className="rounded-2xl border border-spread-ink/10 bg-spread-ink/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{page.path}</p>
                    <p className="mt-1 text-xs text-spread-ink/50">{page.routePattern}</p>
                  </div>
                  <Badge active>{number(page.views)}뷰</Badge>
                </div>
                <p className="mt-3 text-xs text-spread-ink/55">방문자 {number(page.uniqueVisitors)}명 · 1인 평균 {page.avgViewsPerVisitor}회</p>
              </div>
            )) : <EmptyState label="표시할 페이지 데이터가 아직 없습니다." />}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="grid gap-5">
          <SectionHeader
            eyebrow="Dropoff"
            title="이탈 상위 캠페인"
            caption="조회는 충분한데 신청이 약하거나, 신청은 많은데 제출이 낮은 캠페인입니다."
          />
          <div className="grid gap-3">
            {data.dropoffCampaigns.length ? data.dropoffCampaigns.map((row) => (
              <div key={row.campaignId} className="rounded-2xl border border-spread-ink/10 bg-spread-ink/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black">{row.campaignTitle}</p>
                    <p className="mt-1 text-xs text-spread-ink/50">{row.brandName}</p>
                  </div>
                  <Badge active={row.primaryDropoff === "view_to_apply"}>
                    {row.primaryDropoff === "view_to_apply" ? "조회 → 신청 이탈" : "신청 → 제출 이탈"}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-2 text-xs text-spread-ink/65 md:grid-cols-2">
                  <span>조회 {number(row.views)} · 신청률 {row.viewToApplyRate}%</span>
                  <span>신청 {number(row.applications)} · 제출률 {row.applyToSubmissionRate}%</span>
                </div>
              </div>
            )) : <EmptyState label="이탈 상위 캠페인이 아직 없습니다." />}
          </div>
        </Card>

        <Card className="grid gap-5">
          <SectionHeader
            eyebrow="Bottleneck"
            title="병목 구간"
            caption="선정, 제출 시작, 처리 완료까지 오래 걸리는 캠페인을 찾습니다."
          />
          <div className="grid gap-3">
            {data.bottleneckCampaigns.length ? data.bottleneckCampaigns.map((row) => (
              <div key={row.campaignId} className="rounded-2xl border border-spread-ink/10 bg-spread-ink/[0.02] p-4">
                <div>
                  <p className="text-sm font-black">{row.campaignTitle}</p>
                  <p className="mt-1 text-xs text-spread-ink/50">{row.brandName}</p>
                </div>
                <div className="mt-4 grid gap-2 text-xs text-spread-ink/65 md:grid-cols-3">
                  <span>신청 → 선정 {formatHours(row.applyToSelectedHours)}</span>
                  <span>선정 → 제출 시작 {formatHours(row.selectedToSubmissionStartedHours)}</span>
                  <span>제출 완료 → 처리 완료 {formatHours(row.submissionCompletedToProcessedHours)}</span>
                </div>
              </div>
            )) : <EmptyState label="병목 구간 데이터가 아직 없습니다." />}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="grid gap-5">
          <SectionHeader eyebrow="Channels" title="채널별 활동량" caption="어느 채널에서 조회 이후 행동이 이어지는지 확인합니다." />
          <div className="grid gap-3">
            {data.channelActivity.length ? data.channelActivity.map((row) => {
              const total = row.pageViews + row.applications + row.submissions;
              return (
                <div key={row.channelType} className="rounded-2xl border border-spread-ink/10 bg-spread-ink/[0.02] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black">{channelLabels[row.channelType]}</p>
                    <Badge>{number(total)}건</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-spread-ink/60">
                    <span>조회 {number(row.pageViews)}</span>
                    <span>신청 {number(row.applications)}</span>
                    <span>제출 {number(row.submissions)}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-spread-ink/8">
                    <div
                      className="h-2 rounded-full bg-spread-point"
                      style={{ width: `${Math.max(8, (total / Math.max(...data.channelActivity.map((item) => item.pageViews + item.applications + item.submissions), 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            }) : <EmptyState label="채널 활동 데이터가 아직 없습니다." />}
          </div>
        </Card>

        <Card className="grid gap-5">
          <SectionHeader eyebrow="Users" title="활성 사용자" caption="최근 7일 안에 움직인 계정들의 활동량입니다." trailing={<Badge>최근 7일</Badge>} />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs font-black uppercase text-spread-ink/45">
                <tr>
                  <th className="pb-3 pr-4">사용자</th>
                  <th className="pb-3 pr-4">최근 접속</th>
                  <th className="pb-3 pr-4">페이지</th>
                  <th className="pb-3 pr-4">신청</th>
                  <th className="pb-3 pr-4">제출</th>
                  <th className="pb-3">최근 액션</th>
                </tr>
              </thead>
              <tbody>
                {data.activeUsers.length ? data.activeUsers.map((row) => (
                  <tr key={row.userId} className="border-t border-spread-ink/8">
                    <td className="py-3 pr-4">
                      <p className="font-black">{row.nickname}</p>
                      <p className="mt-1 text-xs text-spread-ink/50">{row.role}</p>
                    </td>
                    <td className="py-3 pr-4">{shortDateTime(row.lastSeenAt)}</td>
                    <td className="py-3 pr-4">{number(row.pageViews)}</td>
                    <td className="py-3 pr-4">{number(row.applications)}</td>
                    <td className="py-3 pr-4">{number(row.submissions)}</td>
                    <td className="py-3">{row.lastActionLabel}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-spread-ink/50">활성 사용자 데이터가 아직 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="grid gap-5">
          <SectionHeader eyebrow="Retention" title="가입 코호트" caption="가입일 기준 재방문 흐름을 단순하게 확인합니다." />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs font-black uppercase text-spread-ink/45">
                <tr>
                  <th className="pb-3 pr-4">가입일</th>
                  <th className="pb-3 pr-4">규모</th>
                  <th className="pb-3 pr-4">D+1</th>
                  <th className="pb-3 pr-4">D+7</th>
                  <th className="pb-3">D+30</th>
                </tr>
              </thead>
              <tbody>
                {data.retention.length ? data.retention.map((row) => (
                  <tr key={`${row.cohortDate}-${row.cohortSize}`} className="border-t border-spread-ink/8">
                    <td className="py-3 pr-4">{shortDate(row.cohortDate)}</td>
                    <td className="py-3 pr-4">{number(row.cohortSize)}</td>
                    <td className="py-3 pr-4">{row.day1Rate}%</td>
                    <td className="py-3 pr-4">{row.day7Rate}%</td>
                    <td className="py-3">{row.day30Rate}%</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-spread-ink/50">코호트 데이터가 아직 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="grid gap-5">
          <SectionHeader
            eyebrow="Realtime"
            title="최근 활동 로그"
            caption="막 방금 들어온 움직임을 시간 순서대로 확인합니다."
            trailing={<Badge>{data.recentActivity.length}건</Badge>}
          />
          <div className="grid gap-3">
            {data.recentActivity.length ? data.recentActivity.map((row) => (
              <div key={row.id} className="grid gap-2 rounded-2xl border border-spread-ink/10 bg-spread-ink/[0.02] p-4 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-black">{row.label}</p>
                    {row.userRole ? <Badge>{roleLabels[row.userRole]}</Badge> : null}
                  </div>
                  <p className="mt-1 truncate text-xs text-spread-ink/55">
                    {row.nickname ? `${row.nickname} · ` : "익명 방문 · "}
                    {row.path}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-spread-ink/50">{shortDateTime(row.occurredAt)}</span>
              </div>
            )) : <EmptyState label="최근 활동 로그가 아직 없습니다." />}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, active = false }: { label: string; value: string; sub: string; active?: boolean }) {
  return (
    <Card className={`grid gap-1 ${active ? "border-spread-point bg-spread-point/10" : "bg-spread-ink/[0.02]"}`}>
      <p className="text-xs font-black uppercase text-spread-ink/50">{label}</p>
      <p className={`mt-3 text-3xl font-black ${active ? "text-spread-point" : "text-spread-ink"}`}>{value}</p>
      <p className="mt-2 text-xs text-spread-ink/55">{sub}</p>
    </Card>
  );
}

function TimeMetricCard({ label, hours }: { label: string; hours?: number }) {
  return (
    <div className="rounded-2xl border border-spread-ink/10 bg-spread-ink/[0.02] p-4">
      <p className="text-xs font-semibold text-spread-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-black">{formatHours(hours)}</p>
      <p className="mt-2 text-xs text-spread-ink/55">데이터가 있는 건만 평균 계산</p>
    </div>
  );
}

function TrendStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-spread-ink/10 bg-spread-ink/[0.02] p-4">
      <p className="text-xs font-semibold text-spread-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function MiniBarChart({
  points,
  primaryKey,
  secondaryKey,
  primaryLabel,
  secondaryLabel
}: {
  points: AnalyticsTimeSeriesPoint[];
  primaryKey: keyof AnalyticsTimeSeriesPoint;
  secondaryKey: keyof AnalyticsTimeSeriesPoint;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  const maxValue = Math.max(
    1,
    ...points.map((point) => Math.max(Number(point[primaryKey] ?? 0), Number(point[secondaryKey] ?? 0)))
  );

  return (
    <div className="grid gap-4 rounded-2xl border border-spread-ink/10 bg-spread-ink/[0.02] p-4">
      <div className="flex flex-wrap gap-2 text-xs text-spread-ink/55">
        <Badge active>{primaryLabel}</Badge>
        <Badge>{secondaryLabel}</Badge>
      </div>
      <div className="grid min-h-52 grid-cols-[repeat(auto-fit,minmax(20px,1fr))] items-end gap-2">
        {points.map((point) => {
          const primaryHeight = `${Math.max(8, (Number(point[primaryKey] ?? 0) / maxValue) * 100)}%`;
          const secondaryHeight = `${Math.max(6, (Number(point[secondaryKey] ?? 0) / maxValue) * 100)}%`;
          return (
            <div key={point.date} className="grid gap-2">
              <div className="flex h-40 items-end justify-center gap-1">
                <div className="w-2 rounded-full bg-spread-point" style={{ height: primaryHeight }} />
                <div className="w-2 rounded-full border border-spread-ink/20 bg-spread-ink/15" style={{ height: secondaryHeight }} />
              </div>
              <span className="text-center text-[10px] font-semibold text-spread-ink/45">{point.date.slice(5).replace("-", "/")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function sum(points: AnalyticsTimeSeriesPoint[], key: keyof AnalyticsTimeSeriesPoint) {
  return points.reduce((total, point) => total + Number(point[key] ?? 0), 0);
}

function SectionHeader({
  eyebrow,
  title,
  caption,
  trailing
}: {
  eyebrow: string;
  title: string;
  caption?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase text-spread-ink/50">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-black">{title}</h2>
        {caption ? <p className="mt-2 text-sm text-spread-ink/60">{caption}</p> : null}
      </div>
      {trailing}
    </div>
  );
}

function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-spread-ink/10 px-4 py-4">
      <p className="text-xs font-semibold text-spread-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-spread-ink/15 bg-spread-ink/[0.02] px-4 py-8 text-center text-sm text-spread-ink/50">
      {label}
    </div>
  );
}

function formatHours(hours?: number) {
  if (hours === undefined) return "데이터 없음";
  if (hours < 24) return `${hours.toFixed(1)}시간`;
  return `${(hours / 24).toFixed(1)}일`;
}
