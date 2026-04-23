import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ChannelSettingsPanel } from "@/components/member/channel-settings-panel";
import { MetricCard } from "@/components/metric-card";
import { SubmissionList } from "@/components/submission-list";
import { Badge } from "@/components/ui/badge";
import { Card, Section } from "@/components/ui/card";
import { channelLabels, shortDate, verificationStatusLabels } from "@/lib/labels";
import { getMemberProfile, getServerUser, listMemberSubmissions } from "@/services/spread-service";

export default async function ProfilePage() {
  const currentUser = await getServerUser();
  if (!currentUser) redirect("/login");

  const profile = await getMemberProfile(currentUser.id);
  if (!profile) redirect("/login");

  const { user, channels, stats, activePenalty } = profile;
  const submissions = await listMemberSubmissions(user.id);

  return (
    <AppShell role="member">
      <Section className="grid gap-5">
        <Card className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-spread-point">My</p>
            <h1 className="mt-2 text-4xl font-black">{user.nickname}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-spread-ink/65">{user.bio}</p>
          </div>
          <ChannelSettingsPanel />
        </Card>
        {activePenalty ? (
          <Card className="border-spread-point bg-spread-point/10">
            <p className="text-sm font-black text-spread-point">사용 제한 중</p>
            <p className="mt-2 text-sm leading-6">
              {activePenalty.reason}: {activePenalty.daysLate}일 지연으로 {activePenalty.suspensionDays}일 제한이 적용되었습니다.
              해제일은 {shortDate(activePenalty.endsAt)}입니다.
            </p>
          </Card>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="완료 미션" value={`${user.completedMissions}건`} />
          <MetricCard label="승인률" value={`${stats.approvalRate}%`} />
          <MetricCard label="신청/제출" value={`${stats.totalApplications}/${stats.totalSubmissions}`} />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <h2 className="text-xl font-black">연결 채널</h2>
            <div className="mt-4 grid gap-3">
              {channels.length > 0 ? channels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between rounded-2xl border border-spread-ink/10 p-3">
                  <div>
                    <p className="font-black">{channelLabels[channel.channelType]}</p>
                    <p className="text-sm text-spread-ink/60">
                      {channel.handle} · {(channel.friendCount ?? channel.followerCount).toLocaleString()}명
                    </p>
                  </div>
                  <Badge active={channel.isVerified}>{verificationStatusLabels[channel.verificationStatus]}</Badge>
                </div>
              )) : (
                <p className="text-sm text-spread-ink/50">등록된 채널이 없습니다. 채널을 추가하면 캠페인에 신청할 수 있습니다.</p>
              )}
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-black">내 성과</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge active>선호 채널 {stats.preferredChannel}</Badge>
              <Badge active>강한 포맷 {stats.strongestFormat}</Badge>
              <Badge>최근 승인률 {stats.approvalRate}%</Badge>
            </div>
          </Card>
        </div>
        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">최근 제출</h2>
              <p className="mt-1 text-sm text-spread-ink/60">마이에서 내 기록과 처리 상태를 확인합니다.</p>
            </div>
          </div>
          <SubmissionList submissions={submissions.slice(0, 5)} />
        </div>
      </Section>
    </AppShell>
  );
}
