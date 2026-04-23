import { AppShell } from "@/components/app-shell";
import { CampaignCard } from "@/components/campaign-card";
import { MemberStatsModal } from "@/components/member/member-stats-modal";
import { Badge } from "@/components/ui/badge";
import { Card, Section } from "@/components/ui/card";
import { channelLabels, channelRoles, formatLabels } from "@/lib/labels";
import { currentMember } from "@/lib/mock-data";
import { listCampaigns } from "@/services/spread-service";
import type { ChannelType, FormatType } from "@/types/spread";

const channels: ChannelType[] = ["threads", "x", "wordpress", "kakao"];
const formats: FormatType[] = ["one_line", "story", "comparison", "question", "recommendation", "debate"];

export default async function MemberHomePage() {
  const campaigns = await listCampaigns({ status: "open" });

  return (
    <AppShell role="member">
      <Section className="grid gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3">
              <MemberStatsModal user={currentMember} />
            </div>
            <p className="text-sm font-bold text-spread-point">오늘 가능한 미션</p>
            <h1 className="mt-2 text-4xl font-black">안녕하세요, {currentMember.nickname}님</h1>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="grid gap-4">
            <h2 className="text-2xl font-black">추천 캠페인</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {campaigns.slice(0, 2).map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <Card>
              <h2 className="text-lg font-black">채널 빠른 탐색</h2>
              <div className="mt-4 grid gap-2">
                {channels.map((channel) => (
                  <a key={channel} href={`/member/campaigns?channel=${channel}`} className="flex items-center justify-between rounded-2xl border border-spread-ink/10 px-4 py-3 text-sm font-semibold">
                    {channelLabels[channel]} <span className="text-spread-ink/50">{channelRoles[channel]}</span>
                  </a>
                ))}
              </div>
            </Card>
            <Card>
              <h2 className="text-lg font-black">포맷 탐색</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {formats.map((format) => (
                  <Badge key={format}>{formatLabels[format]}</Badge>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </AppShell>
  );
}
