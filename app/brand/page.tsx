import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { LinkButton } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { getBrandCampaignLimitState, listBrandCampaigns } from "@/services/spread-service";

export default async function BrandPage() {
  const campaigns = await listBrandCampaigns();
  const applications = campaigns.reduce((sum, campaign) => sum + campaign.applicationsCount, 0);
  const selected = campaigns.reduce((sum, campaign) => sum + campaign.selectedCount, 0);
  const limit = await getBrandCampaignLimitState();

  return (
    <AppShell role="brand">
      <Section className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-spread-point">Brand</p>
            <h1 className="mt-2 text-4xl font-black">광고주 대시보드</h1>
          </div>
          <LinkButton href="/brand/campaigns">캠페인 보기</LinkButton>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="내 캠페인" value={`${campaigns.length}`} />
          <MetricCard label="총 지원" value={`${applications}`} />
          <MetricCard label="총 선정" value={`${selected}`} />
        </div>
        <Card className="p-4">
          <p className="text-sm font-black">등록 한도</p>
          <p className="mt-1 text-sm text-spread-ink/65">{limit.message}</p>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">최근 캠페인</h2>
          <div className="mt-4 grid gap-3">
            {campaigns.map((campaign) => (
              <a key={campaign.id} href={`/brand/campaigns/${campaign.id}/applications`} className="rounded-2xl border border-spread-ink/10 p-3">
                <p className="font-black">{campaign.title}</p>
                <p className="mt-1 text-sm text-spread-ink/60">지원 {campaign.applicationsCount} · 선정 {campaign.selectedCount}</p>
              </a>
            ))}
          </div>
        </Card>
      </Section>
    </AppShell>
  );
}
