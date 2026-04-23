import { AppShell } from "@/components/app-shell";
import { CampaignForm } from "@/components/admin/campaign-form";
import { LinkButton } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { getCampaign } from "@/services/spread-service";

export default async function EditCampaignPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await getCampaign(id);

  return (
    <AppShell role="admin">
      <Section>
        {campaign ? (
          <CampaignForm mode="edit" initialCampaign={campaign} />
        ) : (
          <Card className="mx-auto max-w-xl text-center">
            <h1 className="text-2xl font-black">캠페인을 찾을 수 없습니다</h1>
            <p className="mt-3 text-sm text-spread-ink/65">삭제되었거나 접근할 수 없는 캠페인입니다.</p>
            <LinkButton href="/admin/campaigns" className="mt-5">캠페인 목록</LinkButton>
          </Card>
        )}
      </Section>
    </AppShell>
  );
}
