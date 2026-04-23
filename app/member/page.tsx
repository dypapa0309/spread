import { AppShell } from "@/components/app-shell";
import { CampaignCard } from "@/components/campaign-card";
import { MemberStatsModal } from "@/components/member/member-stats-modal";
import { Card, Section } from "@/components/ui/card";
import { channelLabels, channelRoles } from "@/lib/labels";
import { getServerUser, listCampaigns } from "@/services/spread-service";
import type { ChannelType } from "@/types/spread";

const channels: ChannelType[] = ["threads", "x", "wordpress", "kakao"];

export default async function MemberHomePage() {
  const [campaigns, user] = await Promise.all([
    listCampaigns({ status: "open" }),
    getServerUser()
  ]);

  const nickname = user?.nickname ?? "멤버";

  return (
    <AppShell role="member">
      <Section className="grid gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {user && (
              <div className="mb-3">
                <MemberStatsModal user={user} />
              </div>
            )}
            <h1 className="text-4xl font-black">안녕하세요, {nickname}님</h1>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="grid gap-4">
            <h2 className="text-2xl font-black text-spread-point">추천 캠페인</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {campaigns.slice(0, 2).map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <Card>
              <h2 className="text-lg font-black">리뷰 가능 채널</h2>
              <div className="mt-4 grid gap-2">
                {channels.map((channel) => (
                  <a key={channel} href={`/member/campaigns?channel=${channel}`} className="flex items-center justify-between rounded-2xl border border-spread-ink/10 px-4 py-3 text-sm font-semibold">
                    {channelLabels[channel]} <span className="text-spread-ink/50">{channelRoles[channel]}</span>
                  </a>
                ))}
              </div>
            </Card>
            <Card>
              <h2 className="text-lg font-black">운영 포인트</h2>
              <div className="mt-4 grid gap-2 text-sm text-spread-ink/70">
                <p className="rounded-2xl border border-spread-ink/10 px-4 py-3">선정된 뒤에만 제출이 열립니다.</p>
                <p className="rounded-2xl border border-spread-ink/10 px-4 py-3">모든 필수 채널을 제출해야 처리 완료 후보가 됩니다.</p>
                <p className="rounded-2xl border border-spread-ink/10 px-4 py-3">콘텐츠 유지기간은 6개월입니다.</p>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </AppShell>
  );
}
