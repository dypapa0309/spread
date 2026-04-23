import { notFound } from "next/navigation";
import { CampaignApplicationsManager } from "@/components/admin/campaign-applications-manager";
import { AppShell } from "@/components/app-shell";
import { Section } from "@/components/ui/card";
import { getCampaign, listBrandCampaignApplications } from "@/services/spread-service";

export default async function BrandCampaignApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign || campaign.brandId !== "brand-1") notFound();
  const applications = await listBrandCampaignApplications(campaign.id);

  return (
    <AppShell role="brand">
      <Section>
        <CampaignApplicationsManager applications={applications} viewer="brand" />
      </Section>
    </AppShell>
  );
}
