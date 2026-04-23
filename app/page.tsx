import { redirect } from "next/navigation";
import { ArrowRight, Gauge, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LinkButton } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";

export default async function LandingPage() {
  // 로그인된 사용자는 역할에 맞는 홈으로 리다이렉트
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createClient } = await import("@/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
      const role = data?.role ?? "member";
      redirect(role === "admin" ? "/admin" : role === "brand" ? "/brand" : "/member");
    }
  }

  return (
    <AppShell role="public">
      <Section className="grid min-h-[calc(100vh-64px)] content-center gap-8 py-12">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-spread-point bg-spread-point/10 px-4 py-2 text-sm font-bold text-spread-point">
            Threads / X / WordPress / KakaoTalk
          </p>
          <h1 className="text-5xl font-black leading-tight sm:text-7xl">SPREAD</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-spread-ink/70">
            리뷰를 모으는 곳이 아니라, 반응을 퍼뜨리고 전환을 만드는 미션 플랫폼입니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/login">
              시작하기 <ArrowRight size={18} />
            </LinkButton>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["자동 필터링", "URL, 키워드, 금지 표현, 중복을 먼저 걸러요.", Gauge],
            ["반자동 검수", "애매한 제출만 따로 확인합니다.", Sparkles],
            ["체험 완료", "6개월 유지 조건과 상태를 보고 처리를 완료합니다.", ArrowRight]
          ].map(([title, body, Icon]) => (
            <Card key={String(title)}>
              <Icon className="text-spread-point" size={22} />
              <h2 className="mt-4 text-lg font-black">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-spread-ink/65">{body as string}</p>
            </Card>
          ))}
        </div>
      </Section>
    </AppShell>
  );
}
