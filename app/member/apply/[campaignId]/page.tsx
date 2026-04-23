import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ApplicationForm } from "@/components/member/application-form";
import { Section } from "@/components/ui/card";
import { getActivePenalty, getCampaign } from "@/services/spread-service";

export default async function ApplyPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const campaign = await getCampaign(campaignId);
  if (!campaign) notFound();

  return (
    <AppShell role="member">
      <Section>
        <ApplicationForm campaign={campaign} activePenalty={getActivePenalty()} />
      </Section>
    </AppShell>
  );
}
