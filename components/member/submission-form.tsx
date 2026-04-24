"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { PrivacyConsent } from "@/components/privacy-consent";
import { channelLabels, experienceTypeLabels, shortDate, submissionStatusLabels } from "@/lib/labels";
import { calculateDeadlinePenalty, determineSubmissionStatus, runSubmissionAutoCheck } from "@/services/submission-auto-check";
import { getSubmissionChecklist } from "@/lib/client-helpers";
import type { CampaignView, ChannelType, SubmissionEligibility, SubmissionStatus } from "@/types/spread";

export function SubmissionForm({ campaign, eligibility }: { campaign: CampaignView; eligibility: SubmissionEligibility }) {
  const [channelInputs, setChannelInputs] = useState<Record<ChannelType, { postUrl: string; postText: string; screenshotUrl: string; postedAt: string }>>(
    Object.fromEntries(campaign.channels.map((channelType) => [channelType, { postUrl: "", postText: "", screenshotUrl: "", postedAt: "" }])) as Record<ChannelType, { postUrl: string; postText: string; screenshotUrl: string; postedAt: string }>
  );
  const [fulfillmentAgreed, setFulfillmentAgreed] = useState(false);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<{ score: number; status: SubmissionStatus; labels: string[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const checks = useMemo(
    () => campaign.channels.map((channelType) => {
      const input = channelInputs[channelType] ?? { postUrl: "", postText: "", screenshotUrl: "", postedAt: "" };
      return {
        channelType,
        result: runSubmissionAutoCheck({ campaignId: campaign.id, channelType, postUrl: input.postUrl, postText: input.postText, screenshotUrl: input.screenshotUrl })
      };
    }),
    [campaign.channels, campaign.id, channelInputs]
  );
  const deadlinePenalty = calculateDeadlinePenalty(campaign.submissionDueAt);
  const checklist = campaign.channels.flatMap((channelType) =>
    getSubmissionChecklist(channelType).map((item) => ({
      ...item,
      id: `${channelType}-${item.id}`,
      label: `${channelLabels[channelType]} · ${item.label}`,
      checked: Boolean(checklistState[`${channelType}-${item.id}`])
    }))
  );
  const checklistComplete = checklist.every((item) => !item.required || item.checked);
  const channelFormsComplete = campaign.channels.every((channelType) => {
    const input = channelInputs[channelType];
    if (!input?.postText.trim()) return false;
    if (channelType === "kakao") return Boolean(input.screenshotUrl.trim());
    return Boolean(input.postUrl.trim());
  });

  function updateChannelInput(channelType: ChannelType, key: "postUrl" | "postText" | "screenshotUrl" | "postedAt", value: string) {
    setChannelInputs((prev) => ({
      ...prev,
      [channelType]: { ...(prev[channelType] ?? { postUrl: "", postText: "", screenshotUrl: "", postedAt: "" }), [key]: value }
    }));
  }

  if (!eligibility.canSubmit) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <Badge active>{eligibility.reason === "penalty" ? "사용 제한 중" : "제출 대기"}</Badge>
        <h1 className="mt-4 text-3xl font-black">지금은 제출할 수 없습니다</h1>
        <p className="mt-3 text-sm leading-6 text-spread-ink/65">{eligibility.message}</p>
        {eligibility.penalty ? (
          <p className="mt-3 rounded-2xl border border-spread-point bg-spread-point/10 p-3 text-sm font-semibold text-spread-point">
            해제일 {shortDate(eligibility.penalty.endsAt)}
          </p>
        ) : null}
        <LinkButton href={`/member/campaigns/${campaign.id}`} className="mt-6">캠페인으로 돌아가기</LinkButton>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <h1 className="text-3xl font-black">제출하기</h1>
        <p className="mt-2 text-sm text-spread-ink/65">선정된 캠페인입니다. 제출 마감은 {shortDate(campaign.submissionDueAt)}입니다.</p>
        <form
          className="mt-6 grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!fulfillmentAgreed) return;
            if (!checklistComplete) return;
            if (!channelFormsComplete) return;
            setSaving(true);
            setSaveMessage("");
            try {
              const response = await fetch("/api/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  campaignId: campaign.id,
                  submissions: campaign.channels.map((channelType) => ({
                    channelType,
                    ...channelInputs[channelType]
                  }))
                })
              });
              const responseResult = (await response.json()) as { ok?: boolean; message?: string };
              if (!response.ok || !responseResult.ok) {
                setSaveMessage(responseResult.message ?? "제출 저장에 실패했습니다.");
                return;
              }
              const firstCheck = checks[0]?.result;
              const status = firstCheck ? determineSubmissionStatus(firstCheck, campaign) : "needs_review";
              setResult({
                score: Math.round(checks.reduce((sum, item) => sum + item.result.score, 0) / Math.max(checks.length, 1)),
                status,
                labels: checks.flatMap((item) => item.result.issues.map((issue) => `${channelLabels[item.channelType]} ${issue.label}: ${issue.severity}`))
              });
              setSaveMessage(responseResult.message ?? "제출이 저장되었습니다.");
            } catch {
              setSaveMessage("제출 중 오류가 발생했습니다.");
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="rounded-spread border border-spread-ink/10 p-4">
            <h2 className="text-lg font-black">제출 전 셀프검수</h2>
            <p className="mt-1 text-sm text-spread-ink/60">
              필수 조건을 먼저 확인하면 운영자 검수로 넘어가는 건을 줄일 수 있습니다.
            </p>
            <div className="mt-4 grid gap-2">
              {checklist.map((item) => (
                <label key={item.id} className="flex items-start gap-3 rounded-2xl border border-spread-ink/10 p-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={item.checked}
                    onChange={(event) => setChecklistState((prev) => ({ ...prev, [item.id]: event.target.checked }))}
                  />
                  <span>
                    <span className="font-semibold">{item.label}</span>
                    {item.required ? <span className="ml-2 text-xs text-spread-point">필수</span> : null}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-spread border border-spread-ink/10 p-4">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge active>{experienceTypeLabels[campaign.experienceType]}</Badge>
              <Badge>{campaign.offerValueLabel}</Badge>
            </div>
            {campaign.experienceType === "product" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="수령인"><Input placeholder="이름" /></Field>
                <Field label="휴대폰"><Input placeholder="010-0000-0000" /></Field>
                <Field label="우편번호"><Input placeholder="00000" /></Field>
                <Field label="주소"><Input placeholder="도로명 주소" /></Field>
                <Field label="상세주소"><Input placeholder="동/호수" /></Field>
                <Field label="배송 메모"><Input placeholder="문 앞 / 경비실 등" /></Field>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="방문자명"><Input placeholder="이름" /></Field>
                <Field label="휴대폰"><Input placeholder="010-0000-0000" /></Field>
                <Field label="방문 희망일/시간"><Input type="datetime-local" /></Field>
                <Field label="동반 인원"><Input type="number" placeholder="0" /></Field>
                <Field label="요청사항"><Input placeholder="방문 가능 시간, 알레르기 등" /></Field>
              </div>
            )}
          </div>
          <PrivacyConsent checked={fulfillmentAgreed} onChange={setFulfillmentAgreed} variant="fulfillment" />
          {campaign.channels.map((channelType) => {
            const input = channelInputs[channelType] ?? { postUrl: "", postText: "", screenshotUrl: "", postedAt: "" };
            return (
              <div key={channelType} className="rounded-spread border border-spread-ink/10 p-4">
                <h2 className="text-lg font-black">{channelLabels[channelType]} 제출</h2>
                {channelType !== "kakao" ? (
                  <Field label="게시글 링크">
                    <Input value={input.postUrl} onChange={(event) => updateChannelInput(channelType, "postUrl", event.target.value)} placeholder="https://..." />
                  </Field>
                ) : null}
                <Field label="게시 내용">
                  <Textarea value={input.postText} onChange={(event) => updateChannelInput(channelType, "postText", event.target.value)} placeholder="실제로 올린 내용을 붙여넣어 주세요." />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={channelType === "kakao" ? "KakaoTalk 피드 캡처 이미지 URL" : "스크린샷 URL"}>
                    <Input value={input.screenshotUrl} onChange={(event) => updateChannelInput(channelType, "screenshotUrl", event.target.value)} placeholder="/storage/proof.png" />
                  </Field>
                  <Field label="게시 시각">
                    <Input type="datetime-local" value={input.postedAt} onChange={(event) => updateChannelInput(channelType, "postedAt", event.target.value)} />
                  </Field>
                </div>
              </div>
            );
          })}
          {saveMessage ? (
            <p className="rounded-2xl border border-spread-point/30 bg-spread-point/10 px-4 py-3 text-sm font-semibold text-spread-point">{saveMessage}</p>
          ) : null}
          <Button type="submit" disabled={!fulfillmentAgreed || !checklistComplete || !channelFormsComplete || saving}>{saving ? "제출 중..." : "검사 후 제출"}</Button>
        </form>
      </Card>
      <div className="grid gap-4 self-start">
        <Card>
          <h2 className="text-xl font-black">검수 예상 결과</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge active>평균 점수 {Math.round(checks.reduce((sum, item) => sum + item.result.score, 0) / Math.max(checks.length, 1))}</Badge>
            {checks.flatMap((item) => item.result.issues.map((issue) => (
              <Badge key={`${item.channelType}-${issue.code}`} active={issue.severity === "pass"}>
                {channelLabels[item.channelType]} {issue.label}
              </Badge>
            )))}
          </div>
          <p className="mt-4 text-sm leading-6 text-spread-ink/65">
            일부 채널은 자동 승인되지 않고 운영자 검수로 넘어갑니다. 게시물은 6개월 유지 조건을 기준으로 체험 완료 처리됩니다.
          </p>
          {deadlinePenalty.daysLate > 0 ? (
            <p className="mt-3 rounded-2xl border border-spread-point bg-spread-point/10 p-3 text-sm font-semibold text-spread-point">
              제출 마감 초과 예상: {deadlinePenalty.daysLate}일 지연 · {deadlinePenalty.suspensionDays}일 사용 제한
            </p>
          ) : null}
        </Card>
          {result ? (
          <Card>
            <h2 className="text-xl font-black">제출 결과</h2>
            <p className="mt-2 text-sm text-spread-ink/65">예상 상태: {submissionStatusLabels[result.status]}</p>
            {result.status === "auto_approved" ? (
              <p className="mt-2 rounded-2xl border border-spread-point bg-spread-point/10 p-3 text-sm font-semibold text-spread-point">
                자동 검수를 통과했습니다. 운영 확인 뒤 완료 처리됩니다.
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {result.labels.map((label) => <Badge key={label}>{label}</Badge>)}
            </div>
            <LinkButton href="/member/profile#submissions" className="mt-5 w-full">마이에서 확인</LinkButton>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
