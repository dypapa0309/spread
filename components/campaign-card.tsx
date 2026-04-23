import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { channelLabels, formatLabels, money, shortDate } from "@/lib/labels";
import type { CampaignView } from "@/types/spread";

export function CampaignCard({ campaign }: { campaign: CampaignView }) {
  return (
    <Card className="grid gap-4">
      <div
        className="aspect-[16/9] rounded-2xl border border-spread-ink/10 bg-spread-ink/5 bg-cover bg-center"
        style={campaign.coverImageUrl ? { backgroundImage: `url(${campaign.coverImageUrl})` } : undefined}
        aria-label={`${campaign.title} 대표 이미지`}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-spread-ink/60">{campaign.brand.name}</p>
          <h3 className="mt-1 text-xl font-black">{campaign.title}</h3>
        </div>
        <Badge active={campaign.status === "open"}>{campaign.status}</Badge>
      </div>
      <p className="text-sm leading-6 text-spread-ink/72">{campaign.summary}</p>
      <div className="flex flex-wrap gap-2">
        {campaign.channels.map((channel) => (
          <Badge key={channel}>{channelLabels[channel]}</Badge>
        ))}
        {campaign.formats.map((format) => (
          <Badge key={format}>{formatLabels[format]}</Badge>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-spread-ink/55">기본</p>
          <p className="font-black">{money(campaign.baseReward)}</p>
        </div>
        <div>
          <p className="text-xs text-spread-ink/55">보너스</p>
          <p className="font-black">{money(campaign.bonusRewardMax)}</p>
        </div>
        <div>
          <p className="text-xs text-spread-ink/55">마감</p>
          <p className="font-black">{shortDate(campaign.endAt)}</p>
        </div>
      </div>
      <LinkButton href={`/member/campaigns/${campaign.id}`} className="w-full">
        미션 보기
      </LinkButton>
    </Card>
  );
}
