"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Textarea } from "@/components/ui/field";
import { PrivacyConsent } from "@/components/privacy-consent";
import { channelLabels, experienceTypeLabels, shortDate } from "@/lib/labels";
import { getChannelMissingFields } from "@/services/channel-validation";
import type { CampaignView, UserChannel, UserPenalty } from "@/types/spread";

export function ApplicationForm({ campaign, activePenalty, userChannels = [] }: { campaign: CampaignView; activePenalty?: UserPenalty; userChannels?: UserChannel[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const channelState = campaign.channels.map((channelType) => {
    const channel = userChannels.find((item) => item.channelType === channelType && item.isActive);
    return {
      channelType,
      channel,
      missingFields: getChannelMissingFields(channelType, channel)
    };
  });
  const missingChannels = channelState.filter((item) => item.missingFields.length > 0);
  const canApply = agreed && missingChannels.length === 0 && !saving;

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
        <Badge active>검토 중</Badge>
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
          onSubmit={async (event) => {
            event.preventDefault();
            if (!canApply) return;
            setSaving(true);
            setStatusMessage("");
            try {
              const response = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  campaignId: campaign.id,
                  message,
                  applicationPrivacyAgreed: agreed
                })
              });
              const result = (await response.json()) as { ok?: boolean; message?: string };
              if (!response.ok || !result.ok) {
                setStatusMessage(result.message ?? "신청 저장에 실패했습니다.");
                return;
              }
              setSubmitted(true);
              router.refresh();
            } catch {
              setStatusMessage("신청 중 오류가 발생했습니다.");
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="flex flex-wrap gap-2">
            <Badge active>{experienceTypeLabels[campaign.experienceType]}</Badge>
            <Badge>{campaign.offerValueLabel}</Badge>
          </div>
          <div className="rounded-spread border border-spread-ink/10 p-4">
            <h2 className="text-lg font-black">필수 채널</h2>
            <p className="mt-1 text-sm text-spread-ink/60">이 캠페인은 아래 채널 전체에 콘텐츠를 발행해야 합니다.</p>
            <div className="mt-4 grid gap-2">
              {channelState.map((item) => (
                <div key={item.channelType} className="rounded-2xl border border-spread-ink/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black">{channelLabels[item.channelType]}</p>
                    <Badge active={!item.missingFields.length}>{item.missingFields.length ? "정보 부족" : "등록 완료"}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-spread-ink/60">
                    {item.missingFields.length
                      ? `필요: ${item.missingFields.join(", ")}`
                      : `${item.channel?.handle} · ${(item.channel?.friendCount ?? item.channel?.followerCount ?? 0).toLocaleString()}명`}
                  </p>
                </div>
              ))}
            </div>
            {missingChannels.length ? (
              <LinkButton href="/member/profile" variant="outline" className="mt-4 w-full">프로필에서 채널 등록하기</LinkButton>
            ) : null}
          </div>
          <Field label="신청 메모" hint="운영자가 선정할 때 참고하는 짧은 참여 메모입니다.">
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="어떤 방식으로 참여할지 짧게 적어주세요."
            />
          </Field>
          <PrivacyConsent checked={agreed} onChange={setAgreed} variant="application" />
          {statusMessage ? (
            <p className="rounded-2xl border border-spread-point/30 bg-spread-point/10 px-4 py-3 text-sm font-semibold text-spread-point">{statusMessage}</p>
          ) : null}
          <Button type="submit" disabled={!canApply}>{saving ? "신청 중..." : "신청하기"}</Button>
        </form>
      </Card>
      <Card className="self-start">
        <h2 className="text-xl font-black">선정 이후 진행</h2>
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
