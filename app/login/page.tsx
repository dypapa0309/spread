"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";

const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");

  return (
    <AppShell role="public">
      <Section className="grid min-h-[calc(100vh-64px)] place-items-center py-12">
        <div className="w-full max-w-4xl">
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-spread-ink/10 bg-spread-ink/5 p-1">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`rounded-xl px-4 py-2.5 text-sm font-black transition-colors ${tab === "login" ? "bg-spread-point text-white" : "text-spread-ink/60 hover:text-spread-ink"}`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`rounded-xl px-4 py-2.5 text-sm font-black transition-colors ${tab === "signup" ? "bg-spread-point text-white" : "text-spread-ink/60 hover:text-spread-ink"}`}
            >
              회원가입
            </button>
          </div>
          {tab === "login" ? <LoginForm /> : <SignupForm />}
        </div>
      </Section>
    </AppShell>
  );
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState(isMock ? "sia@example.com" : "");
  const [password, setPassword] = useState(isMock ? "mock-password" : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isMock) {
      router.push("/member");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { createClient } = await import("@/supabase/client");
      const supabase = createClient();

      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); setLoading(false); return; }

      const { data: userRow } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const role = userRow?.role ?? "member";
      router.push(role === "admin" ? "/admin" : role === "brand" ? "/brand" : "/member");
      router.refresh();
    } catch {
      setError("로그인 중 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <Card>
        <h1 className="text-3xl font-black">SPREAD 로그인</h1>
        <p className="mt-2 text-sm leading-6 text-spread-ink/65">
          사용자, 광고주, 운영자 모두 이메일 로그인을 사용합니다.
        </p>
        {isMock && (
          <p className="mt-3 rounded-2xl border border-spread-point/30 bg-spread-point/10 px-4 py-3 text-xs font-semibold text-spread-point">
            Mock 모드 — Supabase 환경변수 없이 실행 중입니다. 로그인 버튼을 누르면 바로 진입합니다.
          </p>
        )}
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <Field label="이메일">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </Field>
          {!isMock && (
            <Field label="비밀번호">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </Field>
          )}
          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </Card>
      <Card className="self-start">
        <h2 className="text-xl font-black">광고주 로그인</h2>
        <p className="mt-3 text-sm leading-6 text-spread-ink/65">
          광고주 계정은 관리자가 생성합니다. 캠페인 등록과 지원자 관리는 같은 이메일 로그인으로 접근할 수 있습니다.
        </p>
        <p className="mt-4 text-sm leading-6 text-spread-ink/65">
          광고주 계정이 없다면 아래 이메일로 문의해 주세요.
        </p>
        <a href="mailto:dypapa0309@gmail.com" className="mt-4 block text-sm font-bold text-spread-point">
          dypapa0309@gmail.com
        </a>
      </Card>
    </div>
  );
}

function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [channelType, setChannelType] = useState("threads");
  const [channelHandle, setChannelHandle] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [friendCount, setFriendCount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (isMock) {
    return (
      <Card>
        <h2 className="text-2xl font-black">회원가입</h2>
        <p className="mt-3 text-sm leading-6 text-spread-ink/65">
          Mock 모드에서는 회원가입을 사용할 수 없습니다. Supabase 환경변수를 설정하면 실제 가입이 가능합니다.
        </p>
        <LinkButton href="/member" className="mt-6">Mock 모드로 입장</LinkButton>
      </Card>
    );
  }

  if (done) {
    return (
      <Card className="text-center">
        <h2 className="text-2xl font-black">이메일을 확인해 주세요</h2>
        <p className="mt-4 text-sm leading-7 text-spread-ink/65">
          <strong>{email}</strong>으로 인증 링크를 보냈습니다.
          <br />
          링크를 클릭하면 가입이 완료되고 자동으로 로그인됩니다.
        </p>
        <p className="mt-4 text-xs text-spread-ink/50">
          이메일이 오지 않으면 스팸함을 확인하거나 잠시 후 다시 시도해 주세요.
        </p>
      </Card>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirm) { setError("비밀번호가 일치하지 않습니다."); return; }
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 합니다."); return; }

    setLoading(true);
    setError("");

    try {
      const { createClient } = await import("@/supabase/client");
      const supabase = createClient();

      const isKakao = channelType === "kakao";

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name,
            nickname,
            channel_type: channelType,
            channel_handle: channelHandle,
            channel_name: channelHandle,
            channel_url: channelUrl || null,
            follower_count: isKakao ? 0 : Number(followerCount) || 0,
            friend_count: isKakao ? Number(friendCount) || 0 : null
          }
        }
      });

      if (signUpError) { setError(signUpError.message); setLoading(false); return; }

      // 이메일 인증 없이 바로 세션이 생기는 경우 (확인 비활성화)
      if (data.session) {
        await supabase.from("users").upsert({
          id: data.user!.id,
          role: "member",
          name,
          nickname,
          email,
          bio: "",
          level: 1,
          score: 0,
          completed_missions: 0,
          status: "active"
        });

        if (channelHandle) {
          await supabase.from("user_channels").insert({
            user_id: data.user!.id,
            channel_type: channelType,
            channel_name: channelHandle,
            channel_url: channelUrl || null,
            handle: channelHandle,
            follower_count: isKakao ? 0 : Number(followerCount) || 0,
            friend_count: isKakao ? Number(friendCount) || 0 : null,
            verification_status: "pending",
            is_verified: false,
            is_active: true
          });
        }

        router.push("/member");
        router.refresh();
      } else {
        setDone(true);
      }
    } catch {
      setError("가입 중 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  const isKakao = channelType === "kakao";

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <Card>
        <h2 className="text-2xl font-black">기본 정보</h2>
        <form id="signup-form" className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="이름">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" required />
            </Field>
            <Field label="닉네임">
              <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="spread_me" required />
            </Field>
          </div>
          <Field label="이메일">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="비밀번호">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6자 이상" required />
            </Field>
            <Field label="비밀번호 확인">
              <Input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="동일하게 입력" required />
            </Field>
          </div>
          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </form>
      </Card>
      <Card>
        <h2 className="text-2xl font-black">채널 등록</h2>
        <p className="mt-2 text-sm text-spread-ink/65">캠페인 신청에 사용할 채널을 등록합니다. 가입 후 추가도 가능합니다.</p>
        <div className="mt-6 grid gap-4">
          <Field label="채널">
            <Select value={channelType} onChange={(e) => setChannelType(e.target.value)}>
              <option value="threads">Threads</option>
              <option value="x">X (Twitter)</option>
              <option value="wordpress">WordPress</option>
              <option value="kakao">KakaoTalk</option>
            </Select>
          </Field>
          <Field label={isKakao ? "카카오 닉네임" : "핸들 / 아이디"} hint={isKakao ? "카카오스토리 닉네임을 입력하세요" : "@없이 입력하세요"}>
            <Input value={channelHandle} onChange={(e) => setChannelHandle(e.target.value)} placeholder={isKakao ? "kakao_nickname" : "my_handle"} />
          </Field>
          {!isKakao && (
            <Field label="채널 링크">
              <Input value={channelUrl} onChange={(e) => setChannelUrl(e.target.value)} placeholder="https://..." />
            </Field>
          )}
          <Field label={isKakao ? "카카오 친구수" : "팔로워 수"}>
            {isKakao ? (
              <Input type="number" value={friendCount} onChange={(e) => setFriendCount(e.target.value)} placeholder="1000" />
            ) : (
              <Input type="number" value={followerCount} onChange={(e) => setFollowerCount(e.target.value)} placeholder="3000" />
            )}
          </Field>
          {isKakao && (
            <p className="rounded-2xl border border-spread-ink/10 px-4 py-3 text-xs text-spread-ink/60">
              KakaoTalk은 가입 후 마이 페이지에서 닉네임+친구수가 보이는 캡처를 업로드해 인증해야 합니다.
            </p>
          )}
          <Button type="submit" form="signup-form" disabled={loading}>
            {loading ? "가입 중..." : "가입하기"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
