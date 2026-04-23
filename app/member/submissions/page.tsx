import { AppShell } from "@/components/app-shell";
import { SubmissionList } from "@/components/submission-list";
import { Card, Section } from "@/components/ui/card";
import { listMemberSubmissions } from "@/services/spread-service";

export default async function MemberSubmissionsPage() {
  const submissions = await listMemberSubmissions();

  return (
    <AppShell role="member">
      <Section className="grid gap-5">
        <div>
          <h1 className="text-4xl font-black">내 제출 내역</h1>
          <p className="mt-2 text-sm text-spread-ink/65">자동 체크 점수, 상태, 보상 흐름을 한 번에 봅니다.</p>
        </div>
        <Card className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mini label="전체" value={`${submissions.length}`} />
          <Mini label="검수 필요" value={`${submissions.filter((item) => item.status === "needs_review").length}`} />
          <Mini label="승인/지급" value={`${submissions.filter((item) => ["approved", "paid", "reward_pending", "auto_approved"].includes(item.status)).length}`} />
          <Mini label="평균 점수" value={`${Math.round(submissions.reduce((sum, item) => sum + item.autoCheckScore, 0) / submissions.length)}`} />
        </Card>
        <SubmissionList submissions={submissions} />
      </Section>
    </AppShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-spread-ink/55">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
