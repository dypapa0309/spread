import { AdminSubmissions } from "@/components/admin/admin-submissions";
import { AppShell } from "@/components/app-shell";
import { Section } from "@/components/ui/card";
import { listAdminSubmissions } from "@/services/spread-service";

export default async function AdminSubmissionsPage() {
  const submissions = await listAdminSubmissions();

  return (
    <AppShell role="admin">
      <Section>
        <AdminSubmissions initialSubmissions={submissions} />
      </Section>
    </AppShell>
  );
}
