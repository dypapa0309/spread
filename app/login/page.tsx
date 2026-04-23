import { AppShell } from "@/components/app-shell";
import { LinkButton } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";

export default function LoginPage() {
  return (
    <AppShell role="public">
      <Section className="grid min-h-[calc(100vh-64px)] place-items-center">
        <Card className="w-full max-w-md">
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
      </Section>
    </AppShell>
  );
}
