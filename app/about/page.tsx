import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { LinkButton } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";

export const metadata = {
  title: "플랫폼 소개 | SPREAD",
  description: "Threads, X, WordPress, KakaoTalk — 각 채널의 특징과 SPREAD가 반응을 만드는 방법"
};

const channels = [
  {
    id: "threads",
    name: "Threads",
    tag: "빠른 반응 · 첫인상",
    color: "bg-black",
    textColor: "text-white",
    borderColor: "border-black/10",
    accentBg: "bg-black/5",
    accentText: "text-black",
    headline: "알고리즘이 좋은 반응을 알아서 퍼뜨립니다",
    description:
      "Threads는 팔로워가 적어도 반응이 좋으면 발견됩니다. 짧고 선명한 한 문장이 댓글과 공유를 만들고, 그 반응이 다시 노출을 키웁니다. 신제품 출시 초기, 빠르게 첫 반응을 쌓고 싶을 때 가장 효과적인 채널입니다.",
    strengths: [
      "팔로워 없어도 좋은 콘텐츠는 발견됨 — 진입 장벽이 낮음",
      "댓글·공유가 붙으면 노출이 기하급수적으로 증가",
      "짧은 텍스트 포맷 → 제작 부담 없이 빠른 제출 가능",
      "Instagram과 계정 연동 → 브랜드 크로스 노출 효과"
    ],
    fits: ["신제품·신규 서비스 런칭", "인지도가 아직 낮은 브랜드", "감성적 반응이 중요한 F&B·뷰티·라이프"],
    formats: ["한줄 반응", "질문형 (댓글 유도)", "의견·토론형"],
    example: "\"팀 기록이 흩어질 때 Nova Desk 하나로 반응을 먼저 모아보는 중.\"",
    why: "짧고 직관적인 문장이 알고리즘 반응을 만들고, 브랜드 인지를 빠르게 올립니다."
  },
  {
    id: "x",
    name: "X (Twitter)",
    tag: "확산 · 토론",
    color: "bg-[#1a1a1a]",
    textColor: "text-white",
    borderColor: "border-[#1a1a1a]/10",
    accentBg: "bg-[#1a1a1a]/5",
    accentText: "text-[#1a1a1a]",
    headline: "리트윗 한 번이 수천 명에게 닿습니다",
    description:
      "X는 확산 속도가 가장 빠른 채널입니다. 인용, 리트윗, 해시태그 트렌드를 통해 콘텐츠가 예상치 못한 곳까지 퍼집니다. 의견을 자극하고 토론을 유도하는 포스팅이 가장 잘 작동하며, 브랜드에 대한 공개적인 인식을 빠르게 형성합니다.",
    strengths: [
      "리트윗·인용으로 네트워크 바깥까지 급속 확산",
      "해시태그 트렌딩으로 브랜드 키워드 노출 극대화",
      "토론·비교 포맷이 자연스럽게 반응을 끌어냄",
      "미디어·인플루언서 생태계와 연결되기 쉬운 구조"
    ],
    fits: ["비교가 가능한 카테고리 (앱·디지털·건강)", "이슈성·뉴스성이 있는 제품", "젊은 층 타겟 브랜드"],
    formats: ["의견·토론형", "비교형", "질문형"],
    example: "\"커피 구독은 취향보다 아침 결정을 줄이는 서비스에 가깝지 않을까.\"",
    why: "찬반이 생기는 문장 하나가 리트윗을 만들고, 브랜드 언급을 빠르게 확산시킵니다."
  },
  {
    id: "wordpress",
    name: "WordPress",
    tag: "SEO · 장기 자산",
    color: "bg-[#21759B]",
    textColor: "text-white",
    borderColor: "border-[#21759B]/20",
    accentBg: "bg-[#21759B]/8",
    accentText: "text-[#21759B]",
    headline: "한 번 올린 글이 1년 후에도 검색 유입을 만듭니다",
    description:
      "WordPress 블로그 리뷰는 SNS 포스팅과 다르게 시간이 지날수록 가치가 쌓입니다. 검색 키워드에 최적화된 상세 리뷰는 구매를 고민하는 사람들이 직접 찾아와 읽습니다. 단기 반응보다 장기적인 브랜드 자산을 만들고 싶을 때 가장 효과적입니다.",
    strengths: [
      "검색 유입 — 구매 의도가 있는 독자가 직접 찾아옴",
      "장문 비교·분석 글로 신뢰도와 전환율 동시 확보",
      "콘텐츠 수명이 길어 장기 ROI가 가장 높음",
      "다른 채널 리뷰어가 링크를 인용해 백링크 형성"
    ],
    fits: ["고관여 제품 (건강·디지털·교육·B2B)", "경쟁 제품이 많아 비교 검색이 활발한 카테고리", "블로그 채널을 가진 파워 블로거 확보가 가능한 브랜드"],
    formats: ["비교 리뷰", "상세 체험기", "추천형 (누구에게 맞는지)"],
    example: "\"FitLoop vs 기존 운동 앱 — 루틴 유지율로 비교해봤습니다.\"",
    why: "검색을 통해 구매 직전의 독자를 만납니다. SNS보다 전환 의도가 높은 트래픽입니다."
  },
  {
    id: "kakao",
    name: "KakaoTalk",
    tag: "신뢰 전환 · 지인 추천",
    color: "bg-[#FAE100]",
    textColor: "text-[#1a1a1a]",
    borderColor: "border-[#FAE100]/40",
    accentBg: "bg-[#FAE100]/20",
    accentText: "text-[#7a6000]",
    headline: "가장 가까운 사람의 추천이 가장 강한 전환을 만듭니다",
    description:
      "KakaoTalk 피드는 지인들 사이에서만 보이는 콘텐츠입니다. 광고처럼 느껴지지 않고 신뢰하는 사람의 이야기로 전달되기 때문에 구매 전환율이 모든 채널 중 가장 높습니다. 특히 로컬 비즈니스나 직접 체험이 중요한 서비스에서 강력한 효과를 발휘합니다.",
    strengths: [
      "지인 네트워크 기반 — 광고가 아닌 추천으로 인식됨",
      "구매 전환율이 가장 높은 채널",
      "로컬 체험·방문 후기에 특히 강력한 효과",
      "친구수가 많을수록 도달 범위가 넓어지는 구조"
    ],
    fits: ["로컬 맛집·카페·뷰티샵", "방문 체험형 서비스", "신뢰 기반 추천이 핵심인 제품 (건강·육아·반려)"],
    formats: ["추천형 (누구에게 맞는지)", "체험 인증", "스토리형"],
    example: "\"부모님께 선물하기 좋은 커피 구독으로 Mellow Bean을 추천.\"",
    why: "지인의 한마디가 광고보다 강합니다. 전환이 필요한 순간에 가장 직접적인 채널입니다."
  }
];

export default function AboutPage() {
  return (
    <AppShell role="public">
      {/* Hero */}
      <Section className="py-16">
        <div className="max-w-2xl">
          <p className="inline-flex rounded-full border border-spread-point bg-spread-point/10 px-4 py-2 text-sm font-bold text-spread-point">
            플랫폼 소개
          </p>
          <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl">
            채널마다<br />반응이 다릅니다
          </h1>
          <p className="mt-6 text-lg leading-8 text-spread-ink/70">
            SPREAD는 Threads, X, WordPress, KakaoTalk 네 채널에서 반응을 만듭니다.
            각 채널은 작동 방식이 다르고, 브랜드에 맞는 채널을 선택하는 것이 성과의 시작입니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/login">지금 시작하기</LinkButton>
            <LinkButton href="/" variant="outline">홈으로</LinkButton>
          </div>
        </div>
      </Section>

      {/* Channel sections */}
      {channels.map((ch, i) => (
        <section key={ch.id} className={`border-t border-spread-ink/8 ${i % 2 === 1 ? "bg-spread-ink/[0.02]" : ""}`}>
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            {/* Left */}
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-4 py-1.5 text-sm font-black ${ch.color} ${ch.textColor}`}>
                  {ch.name}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${ch.accentBg} ${ch.accentText} ${ch.borderColor}`}>
                  {ch.tag}
                </span>
              </div>
              <h2 className="mt-5 text-3xl font-black leading-snug sm:text-4xl">
                {ch.headline}
              </h2>
              <p className="mt-5 text-base leading-8 text-spread-ink/70">
                {ch.description}
              </p>
              <div className={`mt-6 rounded-spread border p-4 ${ch.borderColor} ${ch.accentBg}`}>
                <p className={`text-xs font-black uppercase tracking-wider ${ch.accentText}`}>포스팅 예시</p>
                <p className="mt-2 text-sm italic leading-6 text-spread-ink/80">{ch.example}</p>
                <p className="mt-3 text-xs text-spread-ink/55">{ch.why}</p>
              </div>
            </div>

            {/* Right */}
            <div className="grid gap-4">
              <Card>
                <p className="text-xs font-black uppercase tracking-wider text-spread-ink/50">채널 강점</p>
                <ul className="mt-4 grid gap-3">
                  {ch.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-3 text-sm leading-6">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-spread-point" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card>
                  <p className="text-xs font-black uppercase tracking-wider text-spread-ink/50">잘 맞는 브랜드</p>
                  <ul className="mt-3 grid gap-2">
                    {ch.fits.map((f) => (
                      <li key={f} className="text-sm leading-5 text-spread-ink/75">{f}</li>
                    ))}
                  </ul>
                </Card>
                <Card>
                  <p className="text-xs font-black uppercase tracking-wider text-spread-ink/50">추천 포스팅 포맷</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ch.formats.map((f) => (
                      <span key={f} className="rounded-full border border-spread-ink/15 px-3 py-1 text-xs font-semibold">
                        {f}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Channel comparison table */}
      <Section className="py-16">
        <h2 className="text-3xl font-black">한눈에 비교</h2>
        <p className="mt-2 text-sm text-spread-ink/60">브랜드 목표에 맞는 채널을 고르세요.</p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-spread-ink/15">
                <th className="pb-4 pr-6 text-left font-black">채널</th>
                <th className="pb-4 pr-6 text-left font-black">핵심 강점</th>
                <th className="pb-4 pr-6 text-left font-black">전환 속도</th>
                <th className="pb-4 pr-6 text-left font-black">콘텐츠 수명</th>
                <th className="pb-4 text-left font-black">추천 목표</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Threads", "빠른 첫 반응", "⚡⚡⚡", "단기", "인지도 확산"],
                ["X", "급속 확산", "⚡⚡⚡", "단기~중기", "바이럴·토론"],
                ["WordPress", "검색 유입", "⚡", "장기", "SEO·구매 결정"],
                ["KakaoTalk", "신뢰 전환", "⚡⚡", "중기", "로컬·직접 전환"]
              ].map(([name, strength, speed, life, goal]) => (
                <tr key={name} className="border-b border-spread-ink/8">
                  <td className="py-4 pr-6 font-black">{name}</td>
                  <td className="py-4 pr-6 text-spread-ink/75">{strength}</td>
                  <td className="py-4 pr-6">{speed}</td>
                  <td className="py-4 pr-6 text-spread-ink/75">{life}</td>
                  <td className="py-4 text-spread-ink/75">{goal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* CTA */}
      <section className="border-t border-spread-ink/10 bg-spread-point/5">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-black sm:text-4xl">지금 캠페인을 시작해 보세요</h2>
          <p className="max-w-lg text-base leading-7 text-spread-ink/70">
            브랜드에 맞는 채널을 선택하고, 반응을 만들어줄 멤버를 모집하세요.
            첫 캠페인 등록부터 제출 검수까지 SPREAD가 함께합니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton href="/login">광고주로 시작하기</LinkButton>
            <LinkButton href="/login" variant="outline">멤버로 참여하기</LinkButton>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
