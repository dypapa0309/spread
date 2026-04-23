import { notFound } from "next/navigation";
import { CampaignApplicationsManager } from "@/components/admin/campaign-applications-manager";
import { AppShell } from "@/components/app-shell";
import { Section } from "@/components/ui/card";
import { getBrandIdForUser, getCampaign, getServerUser, listBrandCampaignApplications } from "@/services/spread-service";

export default async function BrandCampaignApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [campaign, user] = await Promise.all([getCampaign(id), getServerUser()]);
  if (!campaign || !user) notFound();
  const brandId = await getBrandIdForUser(user.id);
  if (!brandId || campaign.brandId !== brandId) notFound();
  const applications = await listBrandCampaignApplications(campaign.id, brandId);

  return (
    <AppShell role="brand">
      <Section>
        <CampaignApplicationsManager applications={applications} viewer="brand" />
      </Section>
    </AppShell>
  );
}
