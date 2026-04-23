import { notFound } from "next/navigation";
import { CampaignApplicationsManager } from "@/components/admin/campaign-applications-manager";
import { AppShell } from "@/components/app-shell";
import { Section } from "@/components/ui/card";
import { getCampaign, listCampaignApplications } from "@/services/spread-service";

export default async function AdminCampaignApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) notFound();
  const applications = await listCampaignApplications(campaign.id);

  return (
    <AppShell role="admin">
      <Section>
        <CampaignApplicationsManager applications={applications} />
      </Section>
    </AppShell>
  );
}
