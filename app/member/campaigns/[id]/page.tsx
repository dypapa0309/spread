import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CampaignDetail } from "@/components/member/campaign-detail";
import { Section } from "@/components/ui/card";
import { getActivePenalty, getCampaign, getServerUser } from "@/services/spread-service";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [campaign, user] = await Promise.all([getCampaign(id), getServerUser()]);
  if (!campaign) notFound();
  if (!user) redirect("/login");

  const activePenalty = await getActivePenalty(user.id);

  return (
    <AppShell role="member">
      <Section>
        <CampaignDetail campaign={campaign} activePenalty={activePenalty} />
      </Section>
    </AppShell>
  );
}
