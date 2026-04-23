"use client";

import { useState } from "react";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Badge } from "@/components/ui/badge";
import { channelLabels, formatLabels, formatTips, money, reviewModeLabels, shortDate } from "@/lib/labels";
import type { CampaignView, FormatType } from "@/types/spread";

export function CampaignDetail({ campaign }: { campaign: CampaignView }) {
  const [format, setFormat] = useState<FormatType>(campaign.formats[0]);
  const tip = formatTips[format];

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
            {campaign.channels.map((channel) => <Badge key={channel}>{channelLabels[channel]}</Badge>)}
            <Badge active>{reviewModeLabels[campaign.reviewMode]}</Badge>
          </div>
          <h1 className="mt-5 text-4xl font-black leading-tight">{campaign.title}</h1>
          <p className="mt-3 text-sm font-semibold text-spread-ink/60">{campaign.brand.name} · {campaign.productName}</p>
          <p className="mt-5 text-base leading-7 text-spread-ink/72">{campaign.description}</p>
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
          <h2 className="text-lg font-black">보상</h2>
          <div className="mt-4 grid gap-3">
            <Row label="기본 보상" value={money(campaign.baseReward)} />
            <Row label="최대 보너스" value={money(campaign.bonusRewardMax)} />
            <Row label="마감" value={shortDate(campaign.endAt)} />
            <Row label="유지 시간" value={`${campaign.guideline.minLiveHours}시간`} />
            <Row label="최소 길이" value={`${campaign.guideline.minTextLength}자`} />
          </div>
          <LinkButton href={`/member/submit/${campaign.id}`} className="mt-5 w-full">
            참여하기
          </LinkButton>
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
