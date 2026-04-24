import { notFound, redirect } from "next/navigation";
import { EventOnMount } from "@/components/analytics/event-on-mount";
import { AppShell } from "@/components/app-shell";
import { SubmissionForm } from "@/components/member/submission-form";
import { Section } from "@/components/ui/card";
import { checkSubmissionEligibility, getCampaign, getServerUser } from "@/services/spread-service";

export default async function SubmitPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const [campaign, user] = await Promise.all([getCampaign(campaignId), getServerUser()]);

  if (!campaign) notFound();
  if (!user) redirect("/login");

  const eligibility = await checkSubmissionEligibility(campaignId, user.id);

  return (
    <AppShell role="member">
      <Section>
        <EventOnMount eventName="submission_started" campaignId={campaign.id} metadata={{ channels: campaign.channels }} />
        <SubmissionForm campaign={campaign} eligibility={eligibility} />
      </Section>
    </AppShell>
  );
}
