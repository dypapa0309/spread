import { AppShell } from "@/components/app-shell";
import { CampaignForm } from "@/components/admin/campaign-form";
import { Section } from "@/components/ui/card";

export default function EditCampaignPage() {
  return (
    <AppShell role="admin">
      <Section>
        <CampaignForm mode="edit" />
      </Section>
    </AppShell>
  );
}
