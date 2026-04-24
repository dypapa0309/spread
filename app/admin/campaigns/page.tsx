import { AppShell } from "@/components/app-shell";
import { LinkButton } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { campaignStatusLabels, channelLabels, experienceTypeLabels } from "@/lib/labels";
import { listCampaigns } from "@/services/spread-service";

export default async function AdminCampaignsPage() {
  const campaigns = await listCampaigns({ status: "all" });

  return (
    <AppShell role="admin">
      <Section className="grid gap-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black">캠페인 관리</h1>
            <p className="mt-2 text-sm text-spread-ink/65">상태, 채널, 체험 제공 정보를 빠르게 확인합니다.</p>
          </div>
          <LinkButton href="/admin/campaigns/new">새 캠페인</LinkButton>
        </div>
        <div className="grid gap-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="grid gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-spread-ink/60">{campaign.brand.name}</p>
                  <h2 className="text-xl font-black">{campaign.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <LinkButton href={`/admin/campaigns/${campaign.id}/applications`} variant="outline">신청자</LinkButton>
                  <LinkButton href={`/admin/campaigns/${campaign.id}/edit`} variant="outline">수정</LinkButton>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge active={campaign.status === "open"}>{campaignStatusLabels[campaign.status]}</Badge>
                <Badge active>{experienceTypeLabels[campaign.experienceType]}</Badge>
                <Badge>{campaign.category}</Badge>
                {campaign.channels.map((channel) => <Badge key={channel}>{channelLabels[channel]}</Badge>)}
                <Badge>{campaign.offerValueLabel}</Badge>
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
