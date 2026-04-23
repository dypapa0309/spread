import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SubmissionForm } from "@/components/member/submission-form";
import { Section } from "@/components/ui/card";
import { getCampaign } from "@/services/spread-service";

export default async function SubmitPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const campaign = await getCampaign(campaignId);
  if (!campaign) notFound();

  return (
    <AppShell role="member">
      <Section>
        <SubmissionForm campaign={campaign} />
      </Section>
    </AppShell>
  );
}
