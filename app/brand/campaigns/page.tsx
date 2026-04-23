import { AppShell } from "@/components/app-shell";
import { LinkButton } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { experienceTypeLabels } from "@/lib/labels";
import { getBrandCampaignLimitState, listBrandCampaigns } from "@/services/spread-service";

export default async function BrandCampaignsPage() {
  const campaigns = await listBrandCampaigns();
  const limit = await getBrandCampaignLimitState();

  return (
    <AppShell role="brand">
      <Section className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black">내 캠페인</h1>
            <p className="mt-2 text-sm text-spread-ink/65">신청자 선정과 CSV 다운로드를 처리합니다.</p>
          </div>
          {limit.canCreate ? (
            <LinkButton href="/admin/campaigns/new">새 캠페인</LinkButton>
          ) : (
            <span className="rounded-2xl border border-spread-point bg-spread-point/10 px-4 py-3 text-sm font-bold text-spread-point">
              {limit.message}
            </span>
          )}
        </div>
        <Card className="p-4">
          <p className="text-sm font-black">등록 한도</p>
          <p className="mt-1 text-sm text-spread-ink/65">{limit.message}</p>
        </Card>
        <div className="grid gap-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="grid gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-spread-ink/60">{campaign.brand.name}</p>
                  <h2 className="text-xl font-black">{campaign.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <LinkButton href={`/brand/campaigns/${campaign.id}/applications`} variant="outline">신청자</LinkButton>
                  {limit.canCreate ? (
                    <LinkButton href={`/admin/campaigns/new?source=${campaign.id}`} variant="outline">복제</LinkButton>
                  ) : (
                    <span className="inline-flex min-h-11 items-center rounded-2xl border border-spread-ink/15 px-4 py-2 text-sm font-semibold text-spread-ink/45">복제 제한</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge active>{experienceTypeLabels[campaign.experienceType]}</Badge>
                <Badge>{campaign.category}</Badge>
                <Badge>지원 {campaign.applicationsCount}명</Badge>
                <Badge active>선정 {campaign.selectedCount}명</Badge>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </AppShell>
  );
}
