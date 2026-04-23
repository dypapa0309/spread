"use client";

import { useMemo, useState } from "react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, Textarea } from "@/components/ui/field";
import { channelLabels, formatLabels, submissionStatusLabels } from "@/lib/labels";
import type { SubmissionStatus, SubmissionView } from "@/types/spread";

const actions: { label: string; status: SubmissionStatus }[] = [
  { label: "승인", status: "approved" },
  { label: "반려", status: "rejected" },
  { label: "보류", status: "needs_review" },
  { label: "체험 완료", status: "completed" }
];

export function AdminSubmissions({ initialSubmissions }: { initialSubmissions: SubmissionView[] }) {
  const [status, setStatus] = useState<SubmissionStatus | "all">("all");
  const [selectedId, setSelectedId] = useState(initialSubmissions[0]?.id);
  const [localStatus, setLocalStatus] = useState<Record<string, SubmissionStatus>>({});

  const submissions = useMemo(
    () =>
      initialSubmissions
        .map((item) => ({ ...item, status: localStatus[item.id] ?? item.status }))
        .filter((item) => status === "all" || item.status === status),
    [initialSubmissions, localStatus, status]
  );
  const selected = submissions.find((item) => item.id === selectedId) ?? submissions[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-black">제출물 관리</h1>
          <Select className="w-44" value={status} onChange={(event) => setStatus(event.target.value as SubmissionStatus | "all")}>
            <option value="all">전체</option>
            <option value="needs_review">검수 필요</option>
            <option value="auto_approved">자동 승인</option>
            <option value="auto_rejected">자동 반려</option>
            <option value="approved">승인</option>
            <option value="rejected">반려</option>
          </Select>
        </div>
        <div className="mt-5 grid gap-3">
          {submissions.map((submission) => (
            <button
              key={submission.id}
              type="button"
              onClick={() => setSelectedId(submission.id)}
              className="grid gap-3 rounded-spread border border-spread-ink/10 p-4 text-left transition hover:border-spread-point"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-black">{submission.user.nickname}</p>
                  <p className="text-sm text-spread-ink/60">{submission.campaign.title}</p>
                </div>
                <StatusBadge>{submissionStatusLabels[submission.status]}</StatusBadge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{channelLabels[submission.channelType]}</Badge>
                <Badge>{formatLabels[submission.formatType]}</Badge>
                <Badge>자동 {submission.autoCheckScore}</Badge>
              </div>
            </button>
          ))}
        </div>
      </Card>
      {selected ? (
        <Card className="self-start">
          <h2 className="text-2xl font-black">검수 패널</h2>
          <p className="mt-2 text-sm text-spread-ink/60">{selected.user.name} · {selected.brand.name}</p>
          <div className="mt-5 rounded-spread border border-spread-ink/10 p-4">
            <p className="text-sm leading-6">{selected.postText}</p>
          </div>
          <div className="mt-4 grid gap-2">
            <p className="text-sm font-black">자동 검사 결과</p>
            <div className="flex flex-wrap gap-2">
              {selected.autoCheckResult.issues.map((issue) => (
                <Badge key={issue.code} active={issue.severity === "pass"}>{issue.label}</Badge>
              ))}
            </div>
          </div>
          {selected.penalty ? (
            <div className="mt-4 rounded-2xl border border-spread-point bg-spread-point/10 p-4">
              <p className="text-sm font-black text-spread-point">기한 패널티</p>
              <p className="mt-2 text-sm">
                {selected.penalty.daysLate}일 지연 · {selected.penalty.suspensionDays}일 사용 제한
              </p>
            </div>
          ) : null}
          <div className="mt-4 grid gap-2">
            <p className="text-sm font-black">운영자 메모</p>
            <Textarea placeholder="판단 근거를 남겨주세요." defaultValue={selected.reviewNote} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {actions.map((action) => (
              <Button key={action.label} variant={action.status === "approved" ? "primary" : "outline"} onClick={() => setLocalStatus((prev) => ({ ...prev, [selected.id]: action.status }))}>
                {action.label}
              </Button>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
