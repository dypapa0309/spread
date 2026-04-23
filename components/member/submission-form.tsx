"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PrivacyConsent } from "@/components/privacy-consent";
import { channelLabels, experienceTypeLabels, formatLabels, shortDate, submissionStatusLabels } from "@/lib/labels";
import { calculateDeadlinePenalty, determineSubmissionStatus, runSubmissionAutoCheck } from "@/services/submission-auto-check";
import type { CampaignView, ChannelType, FormatType, SubmissionEligibility, SubmissionStatus } from "@/types/spread";

export function SubmissionForm({ campaign, eligibility }: { campaign: CampaignView; eligibility: SubmissionEligibility }) {
  const [channel, setChannel] = useState<ChannelType>(campaign.channels[0]);
  const [format, setFormat] = useState<FormatType>(campaign.formats[0]);
  const [postUrl, setPostUrl] = useState("");
  const [postText, setPostText] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [postedAt, setPostedAt] = useState("");
  const [fulfillmentAgreed, setFulfillmentAgreed] = useState(false);
  const [result, setResult] = useState<{ score: number; status: SubmissionStatus; labels: string[] } | null>(null);

  const check = useMemo(
    () => runSubmissionAutoCheck({ campaignId: campaign.id, channelType: channel, postUrl, postText, screenshotUrl }),
    [campaign.id, channel, postUrl, postText, screenshotUrl]
  );
  const deadlinePenalty = calculateDeadlinePenalty(campaign.submissionDueAt, postedAt ? new Date(postedAt) : undefined);

  if (!eligibility.canSubmit) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <Badge active>{eligibility.reason === "penalty" ? "사용 제한 중" : "제출 대기"}</Badge>
        <h1 className="mt-4 text-3xl font-black">아직 제출할 수 없습니다</h1>
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
          onSubmit={(event) => {
            event.preventDefault();
            if (!fulfillmentAgreed) return;
            const status = determineSubmissionStatus(check, campaign);
            setResult({ score: check.score, status, labels: check.issues.map((issue) => `${issue.label}: ${issue.severity}`) });
          }}
        >
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="채널">
              <Select value={channel} onChange={(event) => setChannel(event.target.value as ChannelType)}>
                {campaign.channels.map((item) => <option key={item} value={item}>{channelLabels[item]}</option>)}
              </Select>
            </Field>
            <Field label="포맷">
              <Select value={format} onChange={(event) => setFormat(event.target.value as FormatType)}>
                {campaign.formats.map((item) => <option key={item} value={item}>{formatLabels[item]}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="게시글 링크" hint="KakaoTalk 피드는 링크 없이 스크린샷 인증만으로도 제출할 수 있습니다.">
            <Input value={postUrl} onChange={(event) => setPostUrl(event.target.value)} placeholder="https://..." />
          </Field>
          <Field label="작성 문구/텍스트">
            <Textarea value={postText} onChange={(event) => setPostText(event.target.value)} placeholder="발행한 문구를 붙여넣으세요." />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="스크린샷 URL">
              <Input value={screenshotUrl} onChange={(event) => setScreenshotUrl(event.target.value)} placeholder="/storage/proof.png" />
            </Field>
            <Field label="게시 시각">
              <Input type="datetime-local" value={postedAt} onChange={(event) => setPostedAt(event.target.value)} />
            </Field>
          </div>
          <Button type="submit" disabled={!fulfillmentAgreed}>자동 체크 후 제출</Button>
        </form>
      </Card>
      <div className="grid gap-4 self-start">
        <Card>
          <h2 className="text-xl font-black">자동 검수 미리보기</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge active>점수 {check.score}</Badge>
            {check.issues.map((issue) => (
              <Badge key={issue.code} active={issue.severity === "pass"}>
                {issue.label}
              </Badge>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-spread-ink/65">
            일부 채널은 자동 승인되지 않고 운영자 검수로 넘어갑니다. 게시물은 최소 유지 시간 이후 체험 완료 처리됩니다.
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
            <div className="mt-4 flex flex-wrap gap-2">
              {result.labels.map((label) => <Badge key={label}>{label}</Badge>)}
            </div>
            <LinkButton href="/member/submissions" className="mt-5 w-full">내 제출 보기</LinkButton>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
