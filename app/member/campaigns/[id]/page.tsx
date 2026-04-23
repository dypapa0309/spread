import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CampaignDetail } from "@/components/member/campaign-detail";
import { Section } from "@/components/ui/card";
import { getCampaign } from "@/services/spread-service";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) notFound();

  return (
    <AppShell role="member">
      <Section>
        <CampaignDetail campaign={campaign} />
      </Section>
    </AppShell>
  );
}
