import Link from "next/link";

export const metadata = {
  title: "SPREAD",
  description: "Threads, X, WordPress, KakaoTalk 채널별 반응 전략"
};

const channels = [
  {
    id: "threads",
    name: "Threads",
    subtitle: "첫인상 · 빠른 반응",
    color: "#8B5CF6",
    headline: "알고리즘이 좋은 반응을\n알아서 퍼뜨려줍니다",
    description: "팔로워가 없어도 상관없습니다. 반응이 좋으면 Threads 알고리즘이 바깥까지 퍼뜨려줍니다. 짧은 문장 하나로 댓글과 공유를 만들고, 그게 다시 노출로 이어지는 구조입니다.",
    quote: "팀 기억이 흩어질 때 Nova Desk 하나로 반응부터 모아보는 중.",
    quoteNote: "짧은 문장이 댓글을 만들고, 브랜드 인지를 자연스럽게 올려줍니다",
    strengths: ["팔로워 없어도 좋은 콘텐츠는 발견됩니다", "댓글·공유가 붙으면 노출이 급격히 늘어납니다", "Instagram 계정과 연동해 크로스 노출이 됩니다", "짧은 글이라 제작 부담이 거의 없습니다"],
    fits: ["신제품 런칭", "인지도가 낮은 브랜드", "F&B · 뷰티", "라이프스타일"],
    formats: ["💬 한줄 반응형", "❓ 질문형 — 댓글 유도", "💭 의견·토론형"]
  },
  {
    id: "x",
    name: "X (Twitter)",
    subtitle: "확산 · 토론",
    color: "#111111",
    headline: "리트윗 한 번이\n수천 명에게 닿습니다",
    description: "인용, 리트윗, 해시태그로 콘텐츠가 예상치 못한 곳까지 퍼집니다. 찬반이 생기는 문장 하나면 충분합니다. 브랜드에 대한 인식을 빠르게 형성하고 싶을 때 가장 효과적입니다.",
    quote: "커피 구독은 혜택보다 아침 결정을 줄이는 서비스에 가깝지 않을까요.",
    quoteNote: "찬반이 생기면 리트윗이 붙고, 브랜드 언급이 자연스럽게 퍼집니다",
    strengths: ["팔로워 바깥까지 급속하게 확산됩니다", "해시태그 트렌딩으로 노출을 극대화합니다", "토론·비교 포맷이 자연스럽게 반응을 만듭니다", "미디어·인플루언서와 연결되기 쉬운 구조입니다"],
    fits: ["앱 · 디지털 서비스", "건강 · 웰니스", "이슈성 제품", "비교 가능한 카테고리"],
    formats: ["💭 의견·토론형", "⚖️ 비교형", "❓ 질문형"]
  },
  {
    id: "wordpress",
    name: "WordPress",
    subtitle: "SEO · 장기 자산",
    color: "#2271B1",
    headline: "한 번 올린 글이\n1년 후에도 유입을 만듭니다",
    description: "검색으로 들어오는 독자는 이미 구매를 고민 중입니다. SNS 팔로워와 다릅니다. 제대로 쓴 리뷰 글 하나가 오랫동안 브랜드 자산이 됩니다.",
    quote: "FitLoop vs 기존 운동 앱 — 루틴 유지 측면에서 직접 비교해봤습니다.",
    quoteNote: "구매 직전의 독자가 검색으로 찾아옵니다. 전환 의도가 가장 높은 트래픽입니다",
    strengths: ["구매 의도가 있는 독자가 검색으로 들어옵니다", "장문 비교·분석 글로 신뢰도와 전환율을 동시에 잡습니다", "다른 채널이 링크를 인용해 백링크가 쌓입니다", "모든 채널 중 장기 ROI가 가장 높습니다"],
    fits: ["건강 · 디지털 · B2B", "교육 서비스", "비교 검색이 많은 카테고리", "파워 블로거 확보 가능"],
    formats: ["⚖️ 비교 리뷰", "📝 상세 체험기", "👍 추천형 — 누구에게 맞는지"]
  },
  {
    id: "kakao",
    name: "KakaoTalk",
    subtitle: "신뢰 전환 · 지인 추천",
    color: "#FAE100",
    headline: "아는 사람의 말 한마디가\n가장 강한 전환을 만듭니다",
    description: "카카오 피드는 광고가 아닌 지인의 이야기로 보입니다. 그래서 전환율이 다릅니다. 로컬 비즈니스나 신뢰가 중요한 서비스라면 이 채널이 핵심입니다.",
    quote: "부모님께 선물하기 좋은 커피 구독, Mellow Bean 써보니까 진짜 좋네요.",
    quoteNote: "광고가 아닌 지인의 추천처럼 읽힙니다. 전환 의도가 가장 직접적입니다",
    strengths: ["광고가 아닌 지인의 글로 인식됩니다", "구매 전환율이 전 채널 중 가장 높습니다", "친구 수가 많을수록 도달 범위가 넓어집니다", "신뢰 기반 추천에 특히 강합니다"],
    fits: ["로컬 맛집 · 카페", "뷰티 · 헬스", "육아 · 반려", "반복 체험형 서비스"],
    formats: ["👍 추천형 — 누구에게 맞는지", "🎟️ 체험 인증", "📖 스토리형"]
  }
];

const overview = [
  ["Threads", "첫인상 · 빠른 반응", "팔로워 없이도 좋은 글은 알고리즘이 퍼뜨려줍니다. 인지도를 빠르게 올리고 싶을 때.", "#8B5CF6"],
  ["X (Twitter)", "확산 · 토론", "리트윗 한 번으로 수천 명에게 닿습니다. 이슈를 만들고 싶은 브랜드에게.", "#111111"],
  ["WordPress", "SEO · 장기 자산", "한 번 올린 글이 1년 뒤에도 검색 유입을 만들어줍니다. 장기 ROI가 가장 높습니다.", "#2271B1"],
  ["KakaoTalk", "신뢰 전환 · 지인 추천", "광고가 아닌 지인의 말로 전달됩니다. 전환율이 가장 높은 채널.", "#FAE100"]
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-[#111]">
      <nav className="mx-auto flex h-[58px] w-full max-w-[1080px] items-center border-b border-[#EBEBEB] px-6 sm:px-12">
        <Link href="/" className="flex items-center gap-2 text-base font-black tracking-normal text-[#4B6BFB]">
          <LogoBox />
          SPREAD
        </Link>
      </nav>

      <section className="mx-auto grid w-full max-w-[1080px] gap-10 px-6 py-16 sm:px-12 lg:grid-cols-2 lg:items-center lg:py-20">
        <div>
          <h1 className="text-[42px] font-black leading-[1.18] tracking-normal sm:text-5xl">
            채널마다<br />
            <span className="text-[#4B6BFB]">반응이 다릅니다</span>
          </h1>
          <p className="mt-5 max-w-[390px] text-[15.5px] leading-8 text-[#555]">
            Threads, X, WordPress, KakaoTalk —<br />
            네 채널이 돌아가는 방식은 완전히 다릅니다.<br />
            브랜드에 맞는 채널을 고르는 것이 성과의 시작입니다.
          </p>
        </div>
        <HeroNetwork />
      </section>

      <section className="border-y border-[#EBEBEB] bg-[#F8F8F8]">
        <div className="mx-auto w-full max-w-[1080px] px-6 py-14 sm:px-12">
          <SectionLabel>채널 overview</SectionLabel>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {overview.map(([name, subtitle, description, color]) => (
              <div key={name} className="rounded-2xl border border-[#EBEBEB] bg-white p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: color }}>
                  <ChannelMark name={name} dark={name === "KakaoTalk"} />
                </div>
                <h2 className="text-base font-extrabold" style={{ color: name === "KakaoTalk" ? "#B8860B" : color }}>
                  {name}
                </h2>
                <p className="mt-1 text-[11.5px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{subtitle}</p>
                <p className="mt-3 text-[13px] leading-6 text-[#555]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {channels.map((channel, index) => (
        <section key={channel.id} className={`border-b border-[#EBEBEB] ${index % 2 ? "bg-[#F8F8F8]" : "bg-white"}`}>
          <div className="mx-auto w-full max-w-[1080px] px-6 py-16 sm:px-12">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px]" style={{ backgroundColor: channel.color }}>
                    <ChannelMark name={channel.name} dark={channel.id === "kakao"} />
                  </div>
                  <span className="text-xl font-extrabold" style={{ color: channel.id === "kakao" ? "#B8860B" : channel.color }}>
                    {channel.name}
                  </span>
                </div>
                <h2 className="whitespace-pre-line text-3xl font-black leading-tight tracking-normal">{channel.headline}</h2>
                <p className="mt-4 max-w-[440px] text-[14.5px] leading-7 text-[#555]">{channel.description}</p>
              </div>
              <div className="pt-1">
                <SectionLabel>포스팅 예시</SectionLabel>
                <div className="rounded-xl border border-[#EBEBEB] bg-white p-5">
                  <p className="text-sm italic leading-7 text-[#333]">"{channel.quote}"</p>
                  <span className="mt-2 block text-xs text-[#9CA3AF]">{channel.quoteNote}</span>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              <InfoCard title="채널 강점" items={channel.strengths} />
              <TagCard title="잘 맞는 브랜드" tags={channel.fits} />
              <FormatCard title="추천 포맷" formats={channel.formats} />
            </div>
          </div>
        </section>
      ))}

      <section className="mx-auto w-full max-w-[1080px] px-6 py-16 sm:px-12">
        <SectionLabel>한눈에 비교</SectionLabel>
        <h2 className="text-[28px] font-black tracking-normal">브랜드 목표에 맞는 채널을 고르세요</h2>
        <p className="mt-2 text-sm text-[#777]">각 채널의 성격이 다르니, 지금 브랜드에 뭐가 필요한지가 기준입니다.</p>
        <div className="mt-9 overflow-x-auto rounded-[14px] border border-[#E5E7EB]">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#F5F5F5] text-[11.5px] uppercase tracking-wider text-[#888]">
                {["채널", "핵심 강점", "전환 속도", "콘텐츠 수명", "추천 목표"].map((head) => (
                  <th key={head} className="border-b border-[#E5E7EB] px-5 py-4 font-bold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Threads", "빠른 첫 반응", 3, "단기", "인지도 확산", "#8B5CF6"],
                ["X (Twitter)", "급속 확산", 3, "단기~중기", "바이럴 · 토론", "#111111"],
                ["WordPress", "검색 유입", 1, "장기", "SEO · 구매 결정", "#2271B1"],
                ["KakaoTalk", "신뢰 전환", 2, "중기", "로컬 · 직접 전환", "#FAE100"]
              ].map(([name, strength, speed, life, goal, color]) => (
                <tr key={String(name)} className="text-[13.5px] text-[#444]">
                  <td className="border-b border-[#E5E7EB] px-5 py-4 font-bold text-[#111]">
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-[7px]" style={{ backgroundColor: String(color) }}>
                        <ChannelMark name={String(name)} dark={name === "KakaoTalk"} small />
                      </span>
                      {name}
                    </span>
                  </td>
                  <td className="border-b border-[#E5E7EB] px-5 py-4">{strength}</td>
                  <td className="border-b border-[#E5E7EB] px-5 py-4"><Stars count={Number(speed)} /></td>
                  <td className="border-b border-[#E5E7EB] px-5 py-4"><LifeBadge>{life}</LifeBadge></td>
                  <td className="border-b border-[#E5E7EB] px-5 py-4">{goal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="bg-[#1A1A2E]">
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6 px-6 py-11 sm:px-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-[19px] font-extrabold tracking-normal text-white">브랜드에 맞는 채널에서 반응을 만들어보세요.</h3>
            <p className="mt-1 text-[13px] text-[#8892B0]">전략 수립부터 콘텐츠 제작, 검수, 성과 분석까지 함께합니다.</p>
          </div>
          <div className="flex items-center gap-2 text-[15px] font-black text-[#6B7BFB]">
            <LogoBox />
            SPREAD
          </div>
        </div>
      </footer>
    </main>
  );
}

function LogoBox() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4B6BFB]">
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <path d="M7.5 1.5L13 4.5V8C13 11 10.5 13.5 7.5 14.5C4.5 13.5 2 11 2 8V4.5L7.5 1.5Z" fill="white" />
      </svg>
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF]">{children}</p>;
}

function HeroNetwork() {
  return (
    <div className="flex justify-center">
      <svg width="360" height="280" viewBox="0 0 360 280" fill="none" aria-hidden="true" className="max-w-full">
        <line x1="180" y1="140" x2="72" y2="64" stroke="#E0E0E0" strokeWidth="1.5" strokeDasharray="5 4" />
        <line x1="180" y1="140" x2="288" y2="64" stroke="#E0E0E0" strokeWidth="1.5" strokeDasharray="5 4" />
        <line x1="180" y1="140" x2="72" y2="216" stroke="#E0E0E0" strokeWidth="1.5" strokeDasharray="5 4" />
        <line x1="180" y1="140" x2="288" y2="216" stroke="#E0E0E0" strokeWidth="1.5" strokeDasharray="5 4" />
        <ChannelNode x={72} y={54} name="Threads" color="#8B5CF6" />
        <ChannelNode x={288} y={54} name="X (Twitter)" color="#111111" />
        <ChannelNode x={72} y={216} name="WordPress" color="#2271B1" />
        <ChannelNode x={288} y={216} name="KakaoTalk" color="#FAE100" dark />
        <rect x="132" y="120" width="96" height="40" rx="12" fill="white" stroke="#DDDFE3" strokeWidth="1.5" />
        <text x="180" y="135" textAnchor="middle" fontSize="9" fill="#4B6BFB">●</text>
        <text x="180" y="151" textAnchor="middle" fontSize="13" fontWeight="900" fill="#4B6BFB">SPREAD</text>
      </svg>
    </div>
  );
}

function ChannelNode({ x, y, name, color, dark = false }: { x: number; y: number; name: string; color: string; dark?: boolean }) {
  return (
    <>
      <circle cx={x} cy={y} r="32" fill={color} />
      {name === "WordPress" ? (
        <text x={x} y={y + 6} textAnchor="middle" fontSize="20" fontWeight="900" fill="white" fontFamily="Georgia,serif">W</text>
      ) : name === "X (Twitter)" ? (
        <>
          <line x1={x - 12} y1={y - 12} x2={x + 12} y2={y + 12} stroke="white" strokeWidth="2.3" strokeLinecap="round" />
          <line x1={x + 12} y1={y - 12} x2={x - 12} y2={y + 12} stroke="white" strokeWidth="2.3" strokeLinecap="round" />
        </>
      ) : name === "KakaoTalk" ? (
        <>
          <ellipse cx={x} cy={y - 3} rx="14" ry="11" fill="#3C1E1E" />
          <polygon points={`${x},${y + 10} ${x - 6},${y + 15} ${x - 1},${y + 8}`} fill="#3C1E1E" />
          <text x={x} y={y + 1} textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#FAE100">TALK</text>
        </>
      ) : (
        <>
          <circle cx={x} cy={y - 4} r="10" fill="none" stroke="white" strokeWidth="2" />
          <circle cx={x} cy={y - 4} r="4.5" fill="white" />
          <line x1={x + 10} y1={y - 4} x2={x + 10} y2={y + 6} stroke="white" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      <text x={x} y={y + (y < 100 ? 44 : 44)} textAnchor="middle" fontSize="11" fontWeight="600" fill={dark ? "#666" : "#666"}>{name}</text>
    </>
  );
}

function ChannelMark({ name, dark = false, small = false }: { name: string; dark?: boolean; small?: boolean }) {
  const size = small ? 14 : 22;
  if (name.includes("WordPress")) return <span className="font-serif text-sm font-black text-white">W</span>;
  if (name.startsWith("X")) {
    return (
      <svg width={size - 4} height={size - 4} viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <line x1="2" y1="2" x2="16" y2="16" stroke="white" strokeWidth="2.3" strokeLinecap="round" />
        <line x1="16" y1="2" x2="2" y2="16" stroke="white" strokeWidth="2.3" strokeLinecap="round" />
      </svg>
    );
  }
  if (name.includes("Kakao")) {
    return (
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <ellipse cx="11" cy="10" rx="8.5" ry="7" fill="#3C1E1E" />
        <polygon points="11,18.5 7,21 9.5,17" fill="#3C1E1E" />
        <text x="11" y="12.5" textAnchor="middle" fontSize="5.5" fontWeight="800" fill="#FAE100">TALK</text>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="10" r="5.5" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="11" cy="10" r="2.5" fill="white" />
      <line x1="16.5" y1="10" x2="16.5" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[14px] border border-[#EBEBEB] bg-white p-6">
      <SectionLabel>{title}</SectionLabel>
      <ul className="mt-4 grid gap-2">
        {items.map((item) => (
          <li key={item} className="relative pl-4 text-[13px] leading-6 text-[#444] before:absolute before:left-0 before:top-[10px] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#4B6BFB]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TagCard({ title, tags }: { title: string; tags: string[] }) {
  return (
    <div className="rounded-[14px] border border-[#EBEBEB] bg-white p-6">
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => <span key={tag} className="rounded-[7px] bg-[#F3F4F6] px-3 py-1.5 text-[12.5px] font-medium text-[#4B5563]">{tag}</span>)}
      </div>
    </div>
  );
}

function FormatCard({ title, formats }: { title: string; formats: string[] }) {
  return (
    <div className="rounded-[14px] border border-[#EBEBEB] bg-white p-6">
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-4 grid gap-3">
        {formats.map((format) => (
          <div key={format} className="flex items-center gap-3">
            <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[#F3F4F6] text-sm">{format.slice(0, 2)}</span>
            <span className="text-[13px] font-semibold text-[#333]">{format.slice(2).trim()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map((item) => <span key={item} className={`h-[13px] w-[13px] rounded-sm ${item < count ? "bg-[#FBBF24]" : "bg-[#E5E7EB]"}`} />)}
    </span>
  );
}

function LifeBadge({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#4B6BFB]">{children}</span>;
}
