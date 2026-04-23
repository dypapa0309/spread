import { AppShell } from "@/components/app-shell";
import { CampaignForm } from "@/components/admin/campaign-form";
import { Section } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function NewCampaignPage() {
  return (
    <AppShell role="admin">
      <Section>
        <CampaignForm />
      </Section>
    </AppShell>
  );
}
