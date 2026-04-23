import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { CampaignCard } from "@/components/campaign-card";
import { Card, Section } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { listCampaigns } from "@/services/spread-service";

export default async function CampaignsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; channel?: string; format?: string; status?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const campaigns = await listCampaigns({
    query: params.q,
    channel: params.channel,
    format: params.format,
    status: params.status as never
  });
  const sorted =
    params.sort === "applications"
      ? [...campaigns].sort((a, b) => b.applicationsCount - a.applicationsCount)
      : params.sort === "deadline"
        ? [...campaigns].sort((a, b) => new Date(a.applyEndAt).getTime() - new Date(b.applyEndAt).getTime())
        : campaigns;

  return (
    <AppShell role="member">
      <Section className="grid gap-5">
        <div>
          <h1 className="text-4xl font-black">캠페인</h1>
          <p className="mt-2 text-sm text-spread-ink/65">채널과 포맷을 골라 오늘 퍼뜨릴 반응을 찾으세요.</p>
        </div>
        <Card>
          <form className="grid gap-3 md:grid-cols-5">
            <Field label="검색">
              <Input name="q" defaultValue={params.q} placeholder="브랜드, 미션" />
            </Field>
            <Field label="채널">
              <Select name="channel" defaultValue={params.channel ?? "all"}>
                <option value="all">전체</option>
                <option value="threads">Threads</option>
                <option value="x">X</option>
                <option value="wordpress">WordPress</option>
                <option value="kakao">KakaoTalk</option>
              </Select>
            </Field>
            <Field label="포맷">
              <Select name="format" defaultValue={params.format ?? "all"}>
                <option value="all">전체</option>
                <option value="one_line">한줄</option>
                <option value="comparison">비교</option>
                <option value="question">질문</option>
                <option value="recommendation">추천</option>
              </Select>
            </Field>
            <Field label="상태">
              <Select name="status" defaultValue={params.status ?? "open"}>
                <option value="open">모집 중</option>
                <option value="all">전체</option>
                <option value="closed">마감</option>
              </Select>
            </Field>
            <Field label="정렬">
              <Select name="sort" defaultValue={params.sort ?? "latest"}>
                <option value="latest">최신순</option>
                <option value="deadline">마감순</option>
                <option value="applications">지원 많은순</option>
              </Select>
            </Field>
            <button className="min-h-12 rounded-2xl bg-spread-point px-4 text-sm font-bold text-white md:col-span-5">필터 적용</button>
          </form>
        </Card>
        <Suspense fallback={<Card>불러오는 중</Card>}>
          {sorted.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sorted.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <Card className="py-14 text-center">
              <h2 className="text-xl font-black">조건에 맞는 미션이 없습니다</h2>
              <p className="mt-2 text-sm text-spread-ink/60">채널이나 상태 필터를 넓혀보세요.</p>
            </Card>
          )}
        </Suspense>
      </Section>
    </AppShell>
  );
}
