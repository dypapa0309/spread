import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { channelLabels, shortDate, submissionStatusLabels } from "@/lib/labels";
import type { SubmissionView } from "@/types/spread";

export function SubmissionList({ submissions, admin = false }: { submissions: SubmissionView[]; admin?: boolean }) {
  if (!submissions.length) {
    return (
      <Card className="py-12 text-center">
        <p className="text-lg font-black">아직 제출물이 없습니다</p>
        <p className="mt-2 text-sm text-spread-ink/60">제출이 생기면 이곳에서 상태를 바로 확인할 수 있습니다.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {submissions.map((submission) => (
        <Card key={submission.id} className="grid gap-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-spread-ink/60">
                {admin ? submission.user.nickname : submission.brand.name}
              </p>
              <h3 className="text-lg font-black">{submission.campaign.title}</h3>
            </div>
            <StatusBadge>{submissionStatusLabels[submission.status]}</StatusBadge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{channelLabels[submission.channelType]}</Badge>
            <Badge>점수 {submission.autoCheckScore}</Badge>
            <Badge>{submission.campaign.offerValueLabel}</Badge>
            {submission.penalty ? <Badge active>{submission.penalty.suspensionDays}일 제한</Badge> : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-spread-ink/65">
            <span>제출 {shortDate(submission.submittedAt)}</span>
            {submission.postUrl ? <a className="font-semibold text-spread-point" href={submission.postUrl}>게시물 보기</a> : <span>캡처 인증</span>}
          </div>
        </Card>
      ))}
    </div>
  );
}
