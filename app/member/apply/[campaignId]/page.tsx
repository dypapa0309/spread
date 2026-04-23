import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ApplicationForm } from "@/components/member/application-form";
import { Section } from "@/components/ui/card";
import { getActivePenalty, getCampaign, getServerUser, listUserChannels } from "@/services/spread-service";

export default async function ApplyPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const [campaign, user] = await Promise.all([getCampaign(campaignId), getServerUser()]);

  if (!campaign) notFound();
  if (!user) redirect("/login");

  const [activePenalty, userChannels] = await Promise.all([
    getActivePenalty(user.id),
    listUserChannels(user.id)
  ]);

  return (
    <AppShell role="member">
      <Section>
        <ApplicationForm campaign={campaign} activePenalty={activePenalty} userChannels={userChannels} />
      </Section>
    </AppShell>
  );
}
