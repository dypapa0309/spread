import { AppShell } from "@/components/app-shell";
import { SubmissionList } from "@/components/submission-list";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { getAdminSummary } from "@/services/spread-service";
import { shortDate } from "@/lib/labels";

export default async function AdminPage() {
  const summary = await getAdminSummary();
  const reviewLoad = summary.needsReview + summary.applicationPending;

  return (
    <AppShell role="admin">
      <Section className="grid gap-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-black text-spread-point">Operations</p>
            <h1 className="mt-2 text-4xl font-black leading-tight">운영 대시보드</h1>
            <p className="mt-3 text-sm leading-6 text-spread-ink/65">
              오늘 처리할 신청, 검수 대기 제출, 진행 중 캠페인을 한 화면에서 확인합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/admin/submissions" variant="outline">제출물 검수</LinkButton>
            <LinkButton href="/admin/campaigns/new">캠페인 생성</LinkButton>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="grid gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-spread-ink/50">Today Queue</p>
                <h2 className="mt-2 text-2xl font-black">오늘 확인할 일</h2>
              </div>
              <Badge active>{reviewLoad}건 대기</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <DashboardMetric label="신청 대기" value={`${summary.applicationPending}`} caption="선정 필요" active />
              <DashboardMetric label="수동 검수" value={`${summary.needsReview}`} caption="운영자 확인" active />
              <DashboardMetric label="오늘 제출" value={`${summary.todaySubmissions}`} caption="신규 유입" />
            </div>
          </Card>

          <Card className="grid gap-5">
            <div>
              <p className="text-xs font-black uppercase text-spread-ink/50">Automation</p>
              <h2 className="mt-2 text-2xl font-black">처리 흐름</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <DashboardMetric label="승인율" value={`${summary.approvalRate}%`} compact />
              <DashboardMetric label="자동 승인" value={`${summary.autoApproved}`} compact />
              <DashboardMetric label="진행 캠페인" value={`${summary.activeCampaigns}`} compact />
            </div>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="grid gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-spread-ink/50">Submissions</p>
                <h2 className="mt-2 text-2xl font-black">최근 제출</h2>
              </div>
              <LinkButton href="/admin/submissions" variant="outline">전체 보기</LinkButton>
            </div>
            <SubmissionList submissions={summary.recentSubmissions} admin />
          </Card>

          <Card className="self-start">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-spread-ink/50">Campaigns</p>
                <h2 className="mt-2 text-2xl font-black">최근 캠페인</h2>
              </div>
              <LinkButton href="/admin/campaigns" variant="outline">관리</LinkButton>
            </div>
            <div className="mt-5 grid gap-2">
              {summary.recentCampaigns.map((campaign) => (
                <a
                  key={campaign.id}
                  href={`/admin/campaigns/${campaign.id}/edit`}
                  className="grid gap-3 rounded-2xl border border-spread-ink/10 p-4 transition hover:border-spread-point"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black leading-5">{campaign.title}</p>
                      <p className="mt-1 text-xs text-spread-ink/55">{campaign.brand.name}</p>
                    </div>
                    <Badge active={campaign.status === "open"}>{campaign.status}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-spread-ink/60">
                    <span>지원 {campaign.applicationsCount}</span>
                    <span>선정 {campaign.selectedCount}</span>
                    <span>마감 {shortDate(campaign.applyEndAt)}</span>
                  </div>
                </a>
              ))}
            </div>
          </Card>
        </div>
      </Section>
    </AppShell>
  );
}

function DashboardMetric({
  label,
  value,
  caption,
  active = false,
  compact = false
}: {
  label: string;
  value: string;
  caption?: string;
  active?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${active ? "border-spread-point bg-spread-point/10" : "border-spread-ink/10 bg-spread-ink/[0.02]"}`}>
      <p className="text-xs font-semibold text-spread-ink/55">{label}</p>
      <p className={`${compact ? "mt-2 text-2xl" : "mt-3 text-3xl"} font-black ${active ? "text-spread-point" : "text-spread-ink"}`}>
        {value}
      </p>
      {caption ? <p className="mt-2 text-xs font-semibold text-spread-ink/55">{caption}</p> : null}
    </div>
  );
}
