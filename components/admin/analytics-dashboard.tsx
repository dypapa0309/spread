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
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl">
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

      <Card className="grid gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-spread-ink/50">Filters</p>
            <h2 className="mt-2 text-xl font-black">기간과 조건</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-spread-ink/55">
            <Badge>{roleLabels[data.filters.role ?? "all"]}</Badge>
            <Badge>{data.filters.channel === "all" || !data.filters.channel ? "전체 채널" : channelLabels[data.filters.channel]}</Badge>
            <Badge>{data.filters.days}일 기준</Badge>
          </div>
        </div>
        <form className="grid gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end" method="get">
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
        {setupMessage ? (
          <div className="rounded-2xl border border-spread-point bg-spread-point/10 p-4 text-sm leading-6 text-spread-ink">
            <p className="font-black text-spread-point">분석 저장소 설정 필요</p>
            <p className="mt-2">{setupMessage}</p>
            <p className="mt-2 text-spread-ink/65">`supabase/analytics-schema.sql`을 적용한 뒤 새로고침하면 실데이터가 표시됩니다.</p>
          </div>
        ) : null}
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="전체 가입자" value={number(data.summary.totalUsers)} sub={`${number(data.summary.newUsers30d)}명 / 30일`} />
        <MetricCard label="오늘 방문" value={number(data.summary.visitorsToday)} sub={`세션 ${number(data.summary.sessionsToday)} · PV ${number(data.summary.pageViewsToday)}`} active />
        <MetricCard label="활성 사용자" value={number(data.summary.activeUsers7d)} sub={`DAU ${number(data.summary.dau)} · WAU ${number(data.summary.wau)} · MAU ${number(data.summary.mau)}`} />
        <MetricCard label="전환율" value={`${data.summary.applicationConversionRate}%`} sub={`신청 → 제출 ${data.summary.submissionConversionRate}%`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="grid gap-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-spread-ink/50">Trend</p>
              <h2 className="mt-2 text-2xl font-black">일별 추이</h2>
            </div>
            <Badge>{data.filters.days}일</Badge>
          </div>
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

        <Card className="grid gap-4">
          <div>
            <p className="text-xs font-black uppercase text-spread-ink/50">Funnel</p>
            <h2 className="mt-2 text-2xl font-black">방문 → 제출</h2>
          </div>
          <div className="grid gap-3">
            {data.funnel.map((step) => (
              <div key={step.key} className="grid gap-2">
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
        <Card className="grid gap-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-spread-ink/50">Campaigns</p>
              <h2 className="mt-2 text-2xl font-black">상위 캠페인</h2>
            </div>
            <Badge>{data.topCampaigns.length}개</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs font-black uppercase text-spread-ink/45">
                <tr>
                  <th className="pb-3 pr-4">캠페인</th>
                  <th className="pb-3 pr-4">조회</th>
                  <th className="pb-3 pr-4">신청</th>
                  <th className="pb-3 pr-4">제출</th>
                  <th className="pb-3">전환</th>
                </tr>
              </thead>
              <tbody>
                {data.topCampaigns.map((row) => (
                  <tr key={row.campaignId} className="border-t border-spread-ink/8">
                    <td className="py-3 pr-4 align-top">
                      <p className="font-black">{row.campaignTitle}</p>
                      <p className="mt-1 text-xs text-spread-ink/50">{row.brandName}</p>
                    </td>
                    <td className="py-3 pr-4">{number(row.views)}</td>
                    <td className="py-3 pr-4">{number(row.applications)}</td>
                    <td className="py-3 pr-4">{number(row.submissions)}</td>
                    <td className="py-3">{row.applicationConversionRate}% / {row.submissionConversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="grid gap-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-spread-ink/50">Pages</p>
              <h2 className="mt-2 text-2xl font-black">상위 페이지</h2>
            </div>
            <Badge>{data.topPages.length}개</Badge>
          </div>
          <div className="grid gap-2">
            {data.topPages.map((page) => (
              <div key={page.path} className="rounded-2xl border border-spread-ink/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{page.path}</p>
                    <p className="mt-1 text-xs text-spread-ink/50">{page.routePattern}</p>
                  </div>
                  <Badge active>{number(page.views)}뷰</Badge>
                </div>
                <p className="mt-3 text-xs text-spread-ink/55">방문자 {number(page.uniqueVisitors)}명 · 1인 평균 {page.avgViewsPerVisitor}회</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="grid gap-4">
          <div>
            <p className="text-xs font-black uppercase text-spread-ink/50">Channels</p>
            <h2 className="mt-2 text-2xl font-black">채널별 활동량</h2>
          </div>
          <div className="grid gap-3">
            {data.channelActivity.map((row) => {
              const total = row.pageViews + row.applications + row.submissions;
              return (
                <div key={row.channelType} className="rounded-2xl border border-spread-ink/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black">{channelLabels[row.channelType]}</p>
                    <Badge>{number(total)}건</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-spread-ink/60">
                    <span>조회 {number(row.pageViews)}</span>
                    <span>신청 {number(row.applications)}</span>
                    <span>제출 {number(row.submissions)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="grid gap-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-spread-ink/50">Users</p>
              <h2 className="mt-2 text-2xl font-black">활성 사용자</h2>
            </div>
            <Badge>최근 7일</Badge>
          </div>
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
                {data.activeUsers.map((row) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="grid gap-4">
          <div>
            <p className="text-xs font-black uppercase text-spread-ink/50">Retention</p>
            <h2 className="mt-2 text-2xl font-black">가입 코호트</h2>
          </div>
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
                {data.retention.map((row) => (
                  <tr key={`${row.cohortDate}-${row.cohortSize}`} className="border-t border-spread-ink/8">
                    <td className="py-3 pr-4">{shortDate(row.cohortDate)}</td>
                    <td className="py-3 pr-4">{number(row.cohortSize)}</td>
                    <td className="py-3 pr-4">{row.day1Rate}%</td>
                    <td className="py-3 pr-4">{row.day7Rate}%</td>
                    <td className="py-3">{row.day30Rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="grid gap-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-spread-ink/50">Realtime</p>
              <h2 className="mt-2 text-2xl font-black">최근 활동 로그</h2>
            </div>
            <Badge>{data.recentActivity.length}건</Badge>
          </div>
          <div className="grid gap-2">
            {data.recentActivity.map((row) => (
              <div key={row.id} className="flex items-start justify-between gap-3 rounded-2xl border border-spread-ink/10 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-black">{row.label}</p>
                  <p className="mt-1 truncate text-xs text-spread-ink/55">
                    {row.nickname ? `${row.nickname} · ` : "익명 방문 · "}
                    {row.path}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-spread-ink/50">{shortDateTime(row.occurredAt)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, active = false }: { label: string; value: string; sub: string; active?: boolean }) {
  return (
    <Card className={active ? "border-spread-point bg-spread-point/10" : ""}>
      <p className="text-xs font-black uppercase text-spread-ink/50">{label}</p>
      <p className={`mt-3 text-3xl font-black ${active ? "text-spread-point" : "text-spread-ink"}`}>{value}</p>
      <p className="mt-2 text-xs text-spread-ink/55">{sub}</p>
    </Card>
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
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2 text-xs text-spread-ink/55">
        <Badge active>{primaryLabel}</Badge>
        <Badge>{secondaryLabel}</Badge>
      </div>
      <div className="grid min-h-48 grid-cols-[repeat(auto-fit,minmax(18px,1fr))] items-end gap-2">
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
