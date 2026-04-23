import { AppShell } from "@/components/app-shell";
import { LinkButton } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { experienceTypeLabels } from "@/lib/labels";
import { listBrandCampaigns } from "@/services/spread-service";

export default async function BrandCampaignsPage() {
  const campaigns = await listBrandCampaigns();

  return (
    <AppShell role="brand">
      <Section className="grid gap-5">
        <div>
          <h1 className="text-4xl font-black">내 캠페인</h1>
          <p className="mt-2 text-sm text-spread-ink/65">신청자 선정과 CSV 다운로드를 처리합니다.</p>
        </div>
        <div className="grid gap-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="grid gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-spread-ink/60">{campaign.brand.name}</p>
                  <h2 className="text-xl font-black">{campaign.title}</h2>
                </div>
                <LinkButton href={`/brand/campaigns/${campaign.id}/applications`} variant="outline">신청자</LinkButton>
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
