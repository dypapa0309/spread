import { AppShell } from "@/components/app-shell";
import { LinkButton } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";

export default function LoginPage() {
  return (
    <AppShell role="public">
      <Section className="grid min-h-[calc(100vh-64px)] place-items-center">
        <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <h1 className="text-3xl font-black">SPREAD 진입</h1>
          <p className="mt-2 text-sm leading-6 text-spread-ink/65">
            MVP에서는 더미 역할로 바로 진입합니다. Supabase Auth는 이 폼의 submit 지점에 연결하면 됩니다.
          </p>
          <div className="mt-6 grid gap-4">
            <Field label="이메일">
              <Input placeholder="you@example.com" defaultValue="sia@example.com" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <LinkButton href="/member">member로 시작</LinkButton>
              <LinkButton href="/admin" variant="outline">admin으로 시작</LinkButton>
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">채널 등록 포함 가입</h2>
          <p className="mt-2 text-sm leading-6 text-spread-ink/65">
            선정 운영을 위해 가입 단계에서 채널 닉네임, 링크, 팔로워/친구수, 인증 캡처를 함께 받습니다.
          </p>
          <div className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="이름"><Input placeholder="이시아" /></Field>
              <Field label="이메일"><Input placeholder="you@example.com" /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="채널"><Select defaultValue="threads"><option value="threads">Threads</option><option value="x">X</option><option value="wordpress">WordPress</option><option value="kakao">KakaoTalk</option></Select></Field>
              <Field label="닉네임/핸들"><Input placeholder="@spread_sia 또는 카카오 닉네임" /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="채널 링크"><Input placeholder="https://www.threads.net/@..." /></Field>
              <Field label="팔로워/친구수"><Input type="number" placeholder="3800" /></Field>
            </div>
            <Field label="인증 캡처 URL" hint="KakaoTalk은 내 아이디/닉네임과 친구수가 보이는 캡처가 필수입니다.">
              <Input placeholder="/storage/channel-verifications/profile.png" />
            </Field>
          </div>
        </Card>
        </div>
      </Section>
    </AppShell>
  );
}
