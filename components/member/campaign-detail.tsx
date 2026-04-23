"use client";

import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Badge } from "@/components/ui/badge";
import { getApplicationCta } from "@/services/spread-service";
import { channelLabels, experienceTypeLabels, formatLabels, formatTips, reviewModeLabels, shortDate } from "@/lib/labels";
import type { CampaignView, FormatType, UserPenalty } from "@/types/spread";

export function CampaignDetail({ campaign, activePenalty }: { campaign: CampaignView; activePenalty?: UserPenalty }) {
  const [format, setFormat] = useState<FormatType>(campaign.formats[0]);
  const tip = formatTips[format];
  const cta = getApplicationCta(campaign.myApplicationStatus, Boolean(activePenalty));
  const ctaHref =
    campaign.myApplicationStatus === "selected"
      ? `/member/submit/${campaign.id}`
      : `/member/apply/${campaign.id}`;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
      <div className="grid gap-5">
        <Card>
          <div
            className="mb-5 aspect-[16/9] rounded-2xl border border-spread-ink/10 bg-spread-ink/5 bg-cover bg-center"
            style={campaign.coverImageUrl ? { backgroundImage: `url(${campaign.coverImageUrl})` } : undefined}
            aria-label={`${campaign.title} 대표 이미지`}
          />
          <div className="flex flex-wrap gap-2">
            <Badge active>{experienceTypeLabels[campaign.experienceType]}</Badge>
            <Badge>{campaign.industry}</Badge>
            <Badge>{campaign.category}</Badge>
            {campaign.channels.map((channel) => <Badge key={channel}>{channelLabels[channel]}</Badge>)}
            <Badge active>{reviewModeLabels[campaign.reviewMode]}</Badge>
            <Badge>모집 {campaign.recruitLimit}명</Badge>
            <Badge>지원 {campaign.applicationsCount}명</Badge>
            <Badge>선정 {campaign.selectedCount}명</Badge>
          </div>
          <h1 className="mt-5 text-4xl font-black leading-tight">{campaign.title}</h1>
          <p className="mt-3 text-sm font-semibold text-spread-ink/60">{campaign.brand.name} · {campaign.productName}</p>
          <p className="mt-5 text-base leading-7 text-spread-ink/72">{campaign.description}</p>
        </Card>
        <Card>
          <h2 className="text-xl font-black">{campaign.experienceType === "product" ? "제공 상품" : "체험 장소"}</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <Row label={campaign.experienceType === "product" ? "상품" : "장소"} value={campaign.experienceType === "product" ? campaign.offerTitle : campaign.venueName ?? campaign.offerTitle} />
            <Row label="제공 내용" value={campaign.offerDescription} />
            <Row label="제공 방식" value={campaign.offerValueLabel} />
            {campaign.experienceType === "local" ? (
              <>
                <Row label="지역" value={`${campaign.regionProvince ?? ""} ${campaign.regionDistrict ?? ""}`.trim()} />
                <Row label="방문 주소" value={campaign.venueAddress ?? "선정 후 안내"} />
              </>
            ) : null}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black">미션 포맷</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {campaign.formats.map((item) => (
              <Chip key={item} selected={item === format} onClick={() => setFormat(item)}>
                {formatLabels[item]}
              </Chip>
            ))}
          </div>
          <div className="mt-5 rounded-spread border border-spread-point bg-spread-point/10 p-4">
            <p className="text-sm font-black text-spread-point">{tip.guide}</p>
            <p className="mt-2 text-sm leading-6">{tip.example}</p>
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black">가이드라인</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Info title="핵심 메시지" items={[campaign.guideline.keyMessage]} />
            <Info title="필수 포인트" items={campaign.guideline.requiredPoints} />
            <Info title="금지 표현" items={campaign.guideline.prohibitedExpressions} />
            <Info title="필수 태그/링크" items={[...campaign.guideline.requiredHashtags, ...campaign.guideline.requiredLinks]} />
          </div>
        </Card>
      </div>
      <aside className="grid gap-4 self-start">
        <Card>
          <h2 className="text-lg font-black">운영 정보</h2>
          <div className="mt-4 grid gap-3">
            <Row label="모집" value={`${campaign.recruitLimit}명`} />
            <Row label="지원" value={`${campaign.applicationsCount}명`} />
            <Row label="선정" value={`${campaign.selectedCount}명`} />
            <Row label="신청 마감" value={shortDate(campaign.applyEndAt)} />
            <Row label="제출 마감" value={shortDate(campaign.submissionDueAt)} />
            <Row label="유지 시간" value={`${campaign.guideline.minLiveHours}시간`} />
            <Row label="최소 길이" value={`${campaign.guideline.minTextLength}자`} />
          </div>
          {cta.disabled ? (
            <Button className="mt-5 w-full" variant="outline" disabled>
              {cta.label}
            </Button>
          ) : (
            <LinkButton href={ctaHref} className="mt-5 w-full">
              {cta.label}
            </LinkButton>
          )}
          {activePenalty ? (
            <p className="mt-3 rounded-2xl border border-spread-point bg-spread-point/10 p-3 text-sm font-semibold text-spread-point">
              {shortDate(activePenalty.endsAt)}까지 사용 제한 중
            </p>
          ) : null}
        </Card>
        <Card>
          <h2 className="text-lg font-black">검수 방식</h2>
          <p className="mt-3 text-sm leading-6 text-spread-ink/65">
            제출 시 URL, 채널, 중복, 키워드, 금지 표현, 최소 길이를 먼저 검사합니다. Threads와 X는 반자동, WordPress는 자동화 친화, KakaoTalk은 인증 중심으로 처리합니다.
          </p>
        </Card>
      </aside>
    </div>
  );
}

function Info({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-black">{title}</p>
      <div className="mt-2 grid gap-2">
        {items.filter(Boolean).map((item) => (
          <span key={item} className="rounded-2xl border border-spread-ink/10 px-3 py-2 text-sm text-spread-ink/70">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-spread-ink/10 py-2 text-sm last:border-b-0">
      <span className="text-spread-ink/60">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
