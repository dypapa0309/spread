import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { LinkButton } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";

export const metadata = {
  title: "플랫폼 소개 | SPREAD",
  description: "Threads, X, WordPress, KakaoTalk 채널별 반응 전략"
};

const channels = [
  {
    id: "threads",
    name: "Threads",
    subtitle: "첫인상 · 빠른 반응",
    mark: "T",
    headline: "알고리즘이 좋은 반응을\n알아서 퍼뜨려줍니다",
    description: "팔로워가 없어도 상관없습니다. 반응이 좋으면 Threads 알고리즘이 바깥까지 퍼뜨려줍니다. 짧은 문장 하나로 댓글과 공유를 만들고, 그게 다시 노출로 이어지는 구조입니다.",
    quote: "팀 기억이 흩어질 때 Nova Desk 하나로 반응부터 모아보는 중.",
    quoteNote: "짧은 문장이 댓글을 만들고, 브랜드 인지를 자연스럽게 올려줍니다.",
    strengths: ["팔로워 없어도 좋은 콘텐츠는 발견됩니다", "댓글과 공유가 붙으면 노출이 빠르게 늘어납니다", "Instagram 계정과 연동해 크로스 노출이 됩니다", "짧은 글이라 제작 부담이 낮습니다"],
    fits: ["신제품 런칭", "인지도가 낮은 브랜드", "F&B · 뷰티", "라이프스타일"],
    formats: ["한줄 반응형", "질문형", "의견·토론형"]
  },
  {
    id: "x",
    name: "X",
    subtitle: "확산 · 토론",
    mark: "X",
    headline: "리포스트 한 번이\n수천 명에게 닿습니다",
    description: "인용, 리포스트, 해시태그로 콘텐츠가 예상치 못한 곳까지 퍼집니다. 찬반이 생기는 문장 하나면 충분합니다. 브랜드에 대한 인식을 빠르게 형성하고 싶을 때 효과적입니다.",
    quote: "커피 구독은 혜택보다 아침 결정을 줄이는 서비스에 가깝지 않을까요.",
    quoteNote: "찬반이 생기면 리포스트가 붙고, 브랜드 언급이 자연스럽게 퍼집니다.",
    strengths: ["팔로워 바깥까지 급속하게 확산됩니다", "해시태그로 노출을 키울 수 있습니다", "토론·비교 포맷이 자연스럽게 반응을 만듭니다", "미디어·인플루언서와 연결되기 쉬운 구조입니다"],
    fits: ["앱 · 디지털 서비스", "건강 · 웰니스", "이슈성 제품", "비교 가능한 카테고리"],
    formats: ["의견·토론형", "비교형", "질문형"]
  },
  {
    id: "wordpress",
    name: "WordPress",
    subtitle: "SEO · 장기 자산",
    mark: "W",
    headline: "한 번 올린 글이\n1년 후에도 유입을 만듭니다",
    description: "검색으로 들어오는 독자는 이미 구매를 고민 중입니다. SNS 팔로워와 다릅니다. 제대로 쓴 리뷰 글 하나가 오랫동안 브랜드 자산이 됩니다.",
    quote: "FitLoop vs 기존 운동 앱, 루틴 유지 측면에서 직접 비교해봤습니다.",
    quoteNote: "구매 직전의 독자가 검색으로 찾아옵니다. 전환 의도가 높은 트래픽입니다.",
    strengths: ["구매 의도가 있는 독자가 검색으로 들어옵니다", "장문 비교·분석 글로 신뢰도와 전환율을 잡습니다", "다른 채널이 링크를 인용해 백링크가 쌓입니다", "장기 ROI가 높은 채널입니다"],
    fits: ["건강 · 디지털 · B2B", "교육 서비스", "비교 검색이 많은 카테고리", "파워 블로거 확보 가능"],
    formats: ["비교 리뷰", "상세 체험기", "추천형"]
  },
  {
    id: "kakao",
    name: "KakaoTalk",
    subtitle: "신뢰 전환 · 지인 추천",
    mark: "K",
    headline: "아는 사람의 말 한마디가\n가장 강한 전환을 만듭니다",
    description: "카카오 피드는 광고가 아닌 지인의 이야기로 보입니다. 그래서 전환율이 다릅니다. 로컬 비즈니스나 신뢰가 중요한 서비스라면 이 채널이 핵심입니다.",
    quote: "부모님께 선물하기 좋은 커피 구독, Mellow Bean 써보니까 좋네요.",
    quoteNote: "광고가 아닌 지인의 추천처럼 읽힙니다. 전환 의도가 직접적입니다.",
    strengths: ["광고가 아닌 지인의 글로 인식됩니다", "구매 전환에 강합니다", "친구 수가 많을수록 도달 범위가 넓어집니다", "신뢰 기반 추천에 특히 강합니다"],
    fits: ["로컬 맛집 · 카페", "뷰티 · 헬스", "육아 · 반려", "반복 체험형 서비스"],
    formats: ["추천형", "체험 인증", "스토리형"]
  }
];

const comparison = [
  ["Threads", "빠른 첫 반응", "빠름", "단기", "인지도 확산"],
  ["X", "급속 확산", "빠름", "단기~중기", "바이럴 · 토론"],
  ["WordPress", "검색 유입", "느림", "장기", "SEO · 구매 결정"],
  ["KakaoTalk", "신뢰 전환", "중간", "중기", "로컬 · 직접 전환"]
];

export default function AboutPage() {
  return (
    <AppShell role="public">
      <Section className="grid gap-12 py-8 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <LinkButton href="/" variant="outline">홈으로</LinkButton>
          <LinkButton href="/login">시작하기</LinkButton>
        </div>

        <section className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-black text-spread-point">Channel Strategy</p>
            <h1 className="mt-4 text-5xl font-black leading-tight sm:text-6xl">
              채널마다<br />
              <span className="text-spread-point">반응이 다릅니다</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-spread-ink/70">
              Threads, X, WordPress, KakaoTalk. 네 채널은 돌아가는 방식이 다릅니다.
              브랜드에 맞는 채널을 고르는 것이 성과의 시작입니다.
            </p>
          </div>
          <Card className="p-0">
            <HeroNetwork />
          </Card>
        </section>
      </Section>

      <section className="border-y border-spread-ink/10 bg-spread-ink/[0.02]">
        <Section className="py-12">
          <SectionLabel>채널 overview</SectionLabel>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((channel) => (
              <Card key={channel.id} className="p-5">
                <ChannelIcon>{channel.mark}</ChannelIcon>
                <h2 className="mt-4 text-lg font-black">{channel.name}</h2>
                <p className="mt-1 text-xs font-bold text-spread-ink/45">{channel.subtitle}</p>
                <p className="mt-4 text-sm leading-6 text-spread-ink/65">{channel.description}</p>
              </Card>
            ))}
          </div>
        </Section>
      </section>

      {channels.map((channel, index) => (
        <section key={channel.id} className={index % 2 ? "bg-spread-ink/[0.02]" : undefined}>
          <Section className="grid gap-8 py-14">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-start">
              <div>
                <div className="flex items-center gap-3">
                  <ChannelIcon>{channel.mark}</ChannelIcon>
                  <div>
                    <h2 className="text-2xl font-black">{channel.name}</h2>
                    <p className="mt-1 text-sm font-semibold text-spread-ink/50">{channel.subtitle}</p>
                  </div>
                </div>
                <h3 className="mt-6 whitespace-pre-line text-3xl font-black leading-tight">{channel.headline}</h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-spread-ink/70">{channel.description}</p>
              </div>
              <Card>
                <SectionLabel>포스팅 예시</SectionLabel>
                <p className="mt-4 text-sm italic leading-7 text-spread-ink/80">"{channel.quote}"</p>
                <p className="mt-3 text-xs text-spread-ink/50">{channel.quoteNote}</p>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <InfoCard title="채널 강점" items={channel.strengths} />
              <TagCard title="잘 맞는 브랜드" tags={channel.fits} />
              <TagCard title="추천 포맷" tags={channel.formats} />
            </div>
          </Section>
        </section>
      ))}

      <Section className="py-14">
        <SectionLabel>한눈에 비교</SectionLabel>
        <h2 className="mt-3 text-3xl font-black">브랜드 목표에 맞는 채널을 고르세요</h2>
        <p className="mt-2 text-sm text-spread-ink/60">각 채널의 성격이 다르니, 지금 브랜드에 뭐가 필요한지가 기준입니다.</p>
        <div className="mt-7 overflow-x-auto rounded-spread border border-spread-ink/10">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-spread-ink/[0.04] text-xs text-spread-ink/55">
              <tr>
                {["채널", "핵심 강점", "전환 속도", "콘텐츠 수명", "추천 목표"].map((head) => (
                  <th key={head} className="border-b border-spread-ink/10 px-5 py-4 font-black">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map(([name, strength, speed, life, goal]) => (
                <tr key={name}>
                  <td className="border-b border-spread-ink/10 px-5 py-4 font-black">{name}</td>
                  <td className="border-b border-spread-ink/10 px-5 py-4 text-spread-ink/70">{strength}</td>
                  <td className="border-b border-spread-ink/10 px-5 py-4">{speed}</td>
                  <td className="border-b border-spread-ink/10 px-5 py-4"><span className="rounded-full border border-spread-point/30 bg-spread-point/10 px-3 py-1 text-xs font-bold text-spread-point">{life}</span></td>
                  <td className="border-b border-spread-ink/10 px-5 py-4 text-spread-ink/70">{goal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <section className="border-t border-spread-ink/10 bg-spread-point/5">
        <Section className="flex flex-col items-center gap-5 py-14 text-center">
          <h2 className="text-3xl font-black">브랜드에 맞는 채널에서 반응을 만들어보세요.</h2>
          <p className="max-w-xl text-sm leading-7 text-spread-ink/70">전략 수립부터 콘텐츠 제출, 검수, 선정 관리까지 SPREAD 안에서 이어집니다.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton href="/login">광고주로 시작하기</LinkButton>
            <LinkButton href="/" variant="outline">홈으로</LinkButton>
          </div>
        </Section>
      </section>
    </AppShell>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-black uppercase tracking-normal text-spread-ink/45">{children}</p>;
}

function ChannelIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-spread-point text-base font-black text-white">
      {children}
    </span>
  );
}

function HeroNetwork() {
  const nodes = [
    { x: 72, y: 54, label: "T", name: "Threads" },
    { x: 288, y: 54, label: "X", name: "X" },
    { x: 72, y: 216, label: "W", name: "WordPress" },
    { x: 288, y: 216, label: "K", name: "KakaoTalk" }
  ];

  return (
    <div className="grid min-h-[300px] place-items-center p-4">
      <svg width="360" height="280" viewBox="0 0 360 280" fill="none" aria-hidden="true" className="max-w-full">
        {nodes.map((node) => (
          <line key={`${node.name}-line`} x1="180" y1="140" x2={node.x} y2={node.y} stroke="currentColor" strokeOpacity="0.16" strokeWidth="1.5" strokeDasharray="5 4" />
        ))}
        {nodes.map((node) => (
          <g key={node.name}>
            <circle cx={node.x} cy={node.y} r="32" className="fill-spread-point" opacity="0.95" />
            <text x={node.x} y={node.y + 6} textAnchor="middle" fontSize="18" fontWeight="900" fill="white">{node.label}</text>
            <text x={node.x} y={node.y + 46} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" opacity="0.55">{node.name}</text>
          </g>
        ))}
        <rect x="132" y="120" width="96" height="40" rx="12" className="fill-spread-bg stroke-spread-ink/15" strokeWidth="1.5" />
        <text x="180" y="145" textAnchor="middle" fontSize="13" fontWeight="900" className="fill-spread-point">SPREAD</text>
      </svg>
    </div>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <SectionLabel>{title}</SectionLabel>
      <ul className="mt-4 grid gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-spread-ink/70">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-spread-point" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function TagCard({ title, tags }: { title: string; tags: string[] }) {
  return (
    <Card>
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full border border-spread-ink/10 px-3 py-1.5 text-xs font-semibold text-spread-ink/70">
            {tag}
          </span>
        ))}
      </div>
    </Card>
  );
}
