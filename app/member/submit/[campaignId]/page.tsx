import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SubmissionForm } from "@/components/member/submission-form";
import { Section } from "@/components/ui/card";
import { getCampaign } from "@/services/spread-service";
import { checkSubmissionEligibility } from "@/services/submission-auto-check";

export default async function SubmitPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const campaign = await getCampaign(campaignId);
  if (!campaign) notFound();
  const eligibility = checkSubmissionEligibility(campaign.id);

  return (
    <AppShell role="member">
      <Section>
        <SubmissionForm campaign={campaign} eligibility={eligibility} />
      </Section>
    </AppShell>
  );
}
