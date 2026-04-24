"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { trackClientEvent } from "@/lib/analytics-client";
import { hasSupabaseEnv } from "@/supabase/env";

const isMock = !hasSupabaseEnv();

function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) return "이메일 또는 비밀번호가 올바르지 않습니다.";
  if (message.includes("Email not confirmed")) return "이메일 인증이 완료되지 않았습니다.";
  if (message.includes("rate limit")) return "잠시 후 다시 시도해 주세요.";
  return message;
}

function getSafeNextPath(value: string | null) {
  if (!value) return null;
  if (!value.startsWith("/admin")) return null;
  if (value.startsWith("//")) return null;
  if (value.startsWith("/admin/login")) return null;
  return value;
}

function useSafeNextPath() {
  return useMemo(() => {
    if (typeof window === "undefined") return null;
    const value = new URLSearchParams(window.location.search).get("next");
    return getSafeNextPath(value);
  }, []);
}

export default function AdminLoginPage() {
  const router = useRouter();
  const nextPath = useSafeNextPath();
  const [email, setEmail] = useState(isMock ? "admin@spread.local" : "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(!isMock);

  useEffect(() => {
    if (isMock) return;

    let active = true;

    async function redirectIfSignedIn() {
      try {
        const { createClient } = await import("@/supabase/client");
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!active) return;
        if (!session) {
          setCheckingSession(false);
          return;
        }

        const role = await getCurrentUserRole();
        if (!active) return;

        if (role === "admin") {
          router.replace(nextPath ?? "/admin");
        } else {
          router.replace(role === "brand" ? "/brand" : "/member");
        }
        router.refresh();
      } catch {
        if (active) setCheckingSession(false);
      }
    }

    redirectIfSignedIn();

    return () => {
      active = false;
    };
  }, [nextPath, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isMock) {
      router.replace(nextPath ?? "/admin");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { createClient } = await import("@/supabase/client");
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError(translateAuthError(authError.message));
        setLoading(false);
        return;
      }

      const role = await getCurrentUserRole();
      if (role !== "admin") {
        await fetch("/api/auth/logout", { method: "POST" });
        setError("관리자 계정만 접근할 수 있습니다.");
        setLoading(false);
        return;
      }

      await trackClientEvent({ eventName: "login_completed", path: "/admin/login", userRole: "admin" });
      router.replace(nextPath ?? "/admin");
      router.refresh();
    } catch {
      setError("로그인 중 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-spread-ink px-6 py-10 text-spread-bg">
        <Card className="w-full max-w-md border-spread-bg/10 bg-spread-ink text-center text-spread-bg">
          <p className="text-sm font-black">관리자 세션 확인 중</p>
          <p className="mt-2 text-sm text-spread-bg/60">로그인 상태를 확인하고 있습니다.</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen bg-spread-ink px-6 py-10 text-spread-bg">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="grid gap-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-spread-point">Admin Access</p>
            <h1 className="mt-4 text-5xl font-black leading-tight">SPREAD 운영 전용 로그인</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-spread-bg/68">
              사용자/광고주 화면과 분리된 운영 전용 진입 화면입니다. 캠페인 관리, 선정, 검수, 분석 페이지는 관리자 계정으로만 접근할 수 있습니다.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              "운영 대시보드와 분석 화면은 관리자 계정만 접근합니다.",
              "일반 사용자와 광고주 계정은 여기서 로그인할 수 없습니다.",
              "로그인 후에는 요청한 admin 경로로 바로 이동합니다."
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-spread-bg/12 bg-spread-bg/5 px-4 py-4 text-sm text-spread-bg/72">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section>
          <Card className="w-full border-spread-bg/12 bg-spread-bg text-spread-ink">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-spread-point">Administrator</p>
                <h2 className="mt-2 text-3xl font-black">관리자 로그인</h2>
                <p className="mt-2 text-sm text-spread-ink/60">SPREAD 운영 계정만 사용할 수 있습니다.</p>
              </div>
              <LinkButton href="/" variant="ghost">홈으로</LinkButton>
            </div>

            {isMock ? (
              <p className="mt-5 rounded-2xl border border-spread-point/30 bg-spread-point/10 px-4 py-3 text-xs font-semibold text-spread-point">
                Mock 모드 — 버튼을 누르면 바로 관리자 화면으로 이동합니다.
              </p>
            ) : null}

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <Field label="이메일">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@spread.local" required />
              </Field>
              {!isMock ? (
                <Field label="비밀번호">
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                </Field>
              ) : null}
              {error ? (
                <p className="rounded-2xl border border-spread-point/30 bg-spread-point/10 px-4 py-3 text-sm font-semibold text-spread-point">
                  {error}
                </p>
              ) : null}
              <Button type="submit" disabled={loading}>
                {loading ? "로그인 중..." : "관리자 로그인"}
              </Button>
            </form>

            <div className="mt-6 border-t border-spread-ink/10 pt-4 text-xs text-spread-ink/48">
              운영 계정 문의: dypapa0309@gmail.com
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

async function getCurrentUserRole(): Promise<"member" | "admin" | "brand"> {
  const response = await fetch("/api/auth/role", { cache: "no-store" });
  if (!response.ok) return "member";

  const result = (await response.json()) as { ok?: boolean; role?: "member" | "admin" | "brand" };
  return result.ok && result.role ? result.role : "member";
}
