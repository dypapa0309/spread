import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SubmissionList } from "@/components/submission-list";
import { LinkButton } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { money } from "@/lib/labels";
import { getAdminSummary } from "@/services/spread-service";

export default async function AdminPage() {
  const summary = await getAdminSummary();

  return (
    <AppShell role="admin">
      <Section className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-spread-point">Operations</p>
            <h1 className="mt-2 text-4xl font-black">운영 대시보드</h1>
          </div>
          <LinkButton href="/admin/campaigns/new">캠페인 생성</LinkButton>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <MetricCard label="진행 캠페인" value={`${summary.activeCampaigns}`} />
          <MetricCard label="오늘 제출" value={`${summary.todaySubmissions}`} />
          <MetricCard label="승인율" value={`${summary.approvalRate}%`} />
          <MetricCard label="보상 예정" value={money(summary.rewardPending)} />
          <MetricCard label="자동 승인" value={`${summary.autoApproved}`} />
          <MetricCard label="선정 대기" value={`${summary.applicationPending}`} />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="mb-4 text-2xl font-black">최근 제출</h2>
            <SubmissionList submissions={summary.recentSubmissions} admin />
          </div>
          <Card className="self-start">
            <h2 className="text-2xl font-black">최근 캠페인</h2>
            <div className="mt-4 grid gap-3">
              {summary.recentCampaigns.map((campaign) => (
                <a key={campaign.id} href={`/admin/campaigns/${campaign.id}/edit`} className="rounded-2xl border border-spread-ink/10 p-3">
                  <p className="font-black">{campaign.title}</p>
                  <p className="mt-1 text-sm text-spread-ink/60">{campaign.brand.name} · 제출 {campaign.submissionsCount}</p>
                </a>
              ))}
            </div>
          </Card>
        </div>
      </Section>
    </AppShell>
  );
}
