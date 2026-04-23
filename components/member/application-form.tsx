"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Select, Textarea } from "@/components/ui/field";
import { PrivacyConsent } from "@/components/privacy-consent";
import { channelLabels, experienceTypeLabels, shortDate } from "@/lib/labels";
import type { CampaignView, ChannelType, UserPenalty } from "@/types/spread";

export function ApplicationForm({ campaign, activePenalty }: { campaign: CampaignView; activePenalty?: UserPenalty }) {
  const [channel, setChannel] = useState<ChannelType>(campaign.channels[0]);
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (activePenalty) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <Badge active>사용 제한 중</Badge>
        <h1 className="mt-4 text-3xl font-black">지금은 신청할 수 없습니다</h1>
        <p className="mt-3 text-sm leading-6 text-spread-ink/65">
          제출 기한 초과 패널티로 {shortDate(activePenalty.endsAt)}까지 새 캠페인 신청이 제한됩니다.
        </p>
        <LinkButton href="/member/profile" className="mt-6">마이에서 확인</LinkButton>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <Badge active>신청 검토 중</Badge>
        <h1 className="mt-4 text-3xl font-black">신청이 접수되었습니다</h1>
        <p className="mt-3 text-sm leading-6 text-spread-ink/65">
          관리자가 채널 정보와 과거 이력을 보고 선정합니다. 선정되면 제출 버튼이 열립니다.
        </p>
        <LinkButton href={`/member/campaigns/${campaign.id}`} className="mt-6">캠페인으로 돌아가기</LinkButton>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <h1 className="text-3xl font-black">캠페인 신청</h1>
        <p className="mt-2 text-sm text-spread-ink/65">{campaign.title}</p>
        <form
          className="mt-6 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (agreed) setSubmitted(true);
          }}
        >
          <div className="flex flex-wrap gap-2">
            <Badge active>{experienceTypeLabels[campaign.experienceType]}</Badge>
            <Badge>{campaign.offerValueLabel}</Badge>
          </div>
          <Field label="사용할 채널">
            <Select value={channel} onChange={(event) => setChannel(event.target.value as ChannelType)}>
              {campaign.channels.map((item) => (
                <option key={item} value={item}>{channelLabels[item]}</option>
              ))}
            </Select>
          </Field>
          <Field label="한줄 신청 메모" hint="운영자가 선정할 때 보는 짧은 참여 의도입니다.">
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="어떤 반응을 만들 수 있는지 짧게 적어주세요."
            />
          </Field>
          <PrivacyConsent checked={agreed} onChange={setAgreed} variant="application" />
          <Button type="submit" disabled={!agreed}>신청하기</Button>
        </form>
      </Card>
      <Card className="self-start">
        <h2 className="text-xl font-black">선정 후 제출</h2>
        <p className="mt-3 text-sm leading-6 text-spread-ink/65">
          참여하기는 확정이 아닙니다. 관리자가 신청자 목록을 확인해 선정하면 제출 페이지가 열립니다.
        </p>
        <div className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between"><span className="text-spread-ink/60">모집</span><strong>{campaign.recruitLimit}명</strong></div>
          <div className="flex justify-between"><span className="text-spread-ink/60">현재 지원</span><strong>{campaign.applicationsCount}명</strong></div>
          <div className="flex justify-between"><span className="text-spread-ink/60">현재 선정</span><strong>{campaign.selectedCount}명</strong></div>
          <div className="flex justify-between"><span className="text-spread-ink/60">신청 마감</span><strong>{shortDate(campaign.applyEndAt)}</strong></div>
        </div>
      </Card>
    </div>
  );
}
