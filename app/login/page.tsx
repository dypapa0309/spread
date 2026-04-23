"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL;

function useCooldown(seconds = 60) {
  const [remaining, setRemaining] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    setRemaining(seconds);
    timer.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearInterval(timer.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  return { remaining, start, active: remaining > 0 };
}

function translateAuthError(message: string): string {
  if (message.includes("rate limit")) return "잠시 후 다시 시도해 주세요. (이메일 발송 횟수 초과)";
  if (message.includes("already registered") || message.includes("User already registered")) return "이미 가입된 이메일입니다. 로그인을 이용해 주세요.";
  if (message.includes("Invalid login credentials")) return "이메일 또는 비밀번호가 올바르지 않습니다.";
  if (message.includes("Email not confirmed")) return "이메일 인증이 완료되지 않았습니다. 받은 편지함을 확인해 주세요.";
  if (message.includes("Password should be")) return "비밀번호는 6자 이상이어야 합니다.";
  if (message.includes("Unable to validate email")) return "유효하지 않은 이메일 형식입니다.";
  return message;
}

type Portal = "member" | "brand";
type MemberTab = "login" | "signup";
type BrandTab = "login" | "signup";

export default function LoginPage() {
  const [portal, setPortal] = useState<Portal>("member");

  return (
    <AppShell role="public">
      <Section className="grid min-h-[calc(100vh-64px)] place-items-center py-12">
        <div className="w-full max-w-4xl">
          {/* 멤버 / 광고주 포털 선택 */}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-spread-ink/10 bg-spread-ink/5 p-1">
            <button
              type="button"
              onClick={() => setPortal("member")}
              className={`rounded-xl px-4 py-3 text-sm font-black transition-colors ${portal === "member" ? "bg-spread-point text-white" : "text-spread-ink/60 hover:text-spread-ink"}`}
            >
              사용자 (멤버)
            </button>
            <button
              type="button"
              onClick={() => setPortal("brand")}
              className={`rounded-xl px-4 py-3 text-sm font-black transition-colors ${portal === "brand" ? "bg-spread-point text-white" : "text-spread-ink/60 hover:text-spread-ink"}`}
            >
              광고주
            </button>
          </div>

          {portal === "member" ? <MemberPortal /> : <BrandPortal />}
        </div>
      </Section>
    </AppShell>
  );
}

// ─────────────────────────────────────────────
// 멤버 포털 (로그인 + 회원가입)
// ─────────────────────────────────────────────
function MemberPortal() {
  const [tab, setTab] = useState<MemberTab>("login");

  return (
    <div>
      <div className="mb-5 flex gap-1 rounded-2xl border border-spread-ink/10 p-1 max-w-xs">
        {(["login", "signup"] as MemberTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${tab === t ? "bg-spread-ink text-spread-bg" : "text-spread-ink/50 hover:text-spread-ink"}`}
          >
            {t === "login" ? "로그인" : "회원가입"}
          </button>
        ))}
      </div>
      {tab === "login" ? <MemberLoginForm /> : <MemberSignupForm />}
    </div>
  );
}

function MemberLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState(isMock ? "sia@example.com" : "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isMock) { router.push("/member"); return; }
    setLoading(true); setError("");
    try {
      const { createClient } = await import("@/supabase/client");
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(translateAuthError(authError.message)); setLoading(false); return; }
      const { data: userRow } = await supabase.from("users").select("role").eq("id", data.user.id).single();
      const role = userRow?.role ?? "member";
      router.push(role === "admin" ? "/admin" : role === "brand" ? "/brand" : "/member");
      router.refresh();
    } catch { setError("로그인 중 오류가 발생했습니다."); setLoading(false); }
  }

  return (
    <Card className="max-w-md">
      <h2 className="text-2xl font-black">사용자 로그인</h2>
      {isMock && (
        <p className="mt-3 rounded-2xl border border-spread-point/30 bg-spread-point/10 px-4 py-3 text-xs font-semibold text-spread-point">
          Mock 모드 — 버튼을 누르면 바로 진입합니다.
        </p>
      )}
      <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <Field label="이메일">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </Field>
        {!isMock && (
          <Field label="비밀번호">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </Field>
        )}
        {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? "로그인 중..." : "로그인"}</Button>
      </form>
    </Card>
  );
}

function MemberSignupForm() {
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
  const cooldown = useCooldown(60);

  if (isMock) {
    return (
      <Card className="max-w-md">
        <h2 className="text-2xl font-black">회원가입</h2>
        <p className="mt-3 text-sm text-spread-ink/65">Mock 모드에서는 회원가입을 사용할 수 없습니다.</p>
        <LinkButton href="/member" className="mt-5">Mock 모드로 입장</LinkButton>
      </Card>
    );
  }

  if (done) return <EmailConfirmCard email={email} type="member" />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirm) { setError("비밀번호가 일치하지 않습니다."); return; }
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 합니다."); return; }
    setLoading(true); setError("");
    try {
      const { createClient } = await import("@/supabase/client");
      const supabase = createClient();
      const isKakao = channelType === "kakao";
      const { data, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { name, nickname, role: "member", channel_type: channelType, channel_handle: channelHandle, channel_name: channelHandle, channel_url: channelUrl || null, follower_count: isKakao ? 0 : Number(followerCount) || 0, friend_count: isKakao ? Number(friendCount) || 0 : null }
        }
      });
      if (signUpError) {
        const msg = translateAuthError(signUpError.message);
        setError(msg);
        if (signUpError.message.includes("rate limit")) cooldown.start();
        setLoading(false); return;
      }
      if (data.session) {
        await supabase.from("users").upsert({ id: data.user!.id, role: "member", name, nickname, email, bio: "", level: 1, score: 0, completed_missions: 0, status: "active" });
        if (channelHandle) {
          await supabase.from("user_channels").insert({ user_id: data.user!.id, channel_type: channelType, channel_name: channelHandle, channel_url: channelUrl || null, handle: channelHandle, follower_count: isKakao ? 0 : Number(followerCount) || 0, friend_count: isKakao ? Number(friendCount) || 0 : null, verification_status: "pending", is_verified: false, is_active: true });
        }
        router.push("/member"); router.refresh();
      } else { setDone(true); }
    } catch { setError("가입 중 오류가 발생했습니다."); setLoading(false); }
  }

  const isKakao = channelType === "kakao";
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <h2 className="text-2xl font-black">기본 정보</h2>
        <form id="member-signup" className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="이름"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" required /></Field>
            <Field label="닉네임"><Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="spread_me" required /></Field>
          </div>
          <Field label="이메일"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="비밀번호"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6자 이상" required /></Field>
            <Field label="비밀번호 확인"><Input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="동일하게 입력" required /></Field>
          </div>
          {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        </form>
      </Card>
      <Card>
        <h2 className="text-2xl font-black">채널 등록</h2>
        <p className="mt-2 text-sm text-spread-ink/65">캠페인 신청에 사용할 채널입니다. 가입 후 추가도 가능합니다.</p>
        <div className="mt-5 grid gap-4">
          <Field label="채널"><Select value={channelType} onChange={(e) => setChannelType(e.target.value)}><option value="threads">Threads</option><option value="x">X (Twitter)</option><option value="wordpress">WordPress</option><option value="kakao">KakaoTalk</option></Select></Field>
          <Field label={isKakao ? "카카오 닉네임" : "핸들 / 아이디"}>
            <Input value={channelHandle} onChange={(e) => setChannelHandle(e.target.value)} placeholder={isKakao ? "kakao_nickname" : "my_handle"} />
          </Field>
          {!isKakao && <Field label="채널 링크"><Input value={channelUrl} onChange={(e) => setChannelUrl(e.target.value)} placeholder="https://..." /></Field>}
          <Field label={isKakao ? "카카오 친구수" : "팔로워 수"}>
            {isKakao
              ? <Input type="number" value={friendCount} onChange={(e) => setFriendCount(e.target.value)} placeholder="1000" />
              : <Input type="number" value={followerCount} onChange={(e) => setFollowerCount(e.target.value)} placeholder="3000" />}
          </Field>
          <Button type="submit" form="member-signup" disabled={loading || cooldown.active}>
            {loading ? "가입 중..." : cooldown.active ? `잠시 후 다시 시도해 주세요 (${cooldown.remaining}초)` : "가입하기"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// 광고주 포털 (로그인 + 가입 신청)
// ─────────────────────────────────────────────
function BrandPortal() {
  const [tab, setTab] = useState<BrandTab>("login");

  return (
    <div>
      <div className="mb-5 flex gap-1 rounded-2xl border border-spread-ink/10 p-1 max-w-xs">
        {(["login", "signup"] as BrandTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${tab === t ? "bg-spread-ink text-spread-bg" : "text-spread-ink/50 hover:text-spread-ink"}`}
          >
            {t === "login" ? "로그인" : "가입 신청"}
          </button>
        ))}
      </div>
      {tab === "login" ? <BrandLoginForm /> : <BrandSignupForm />}
    </div>
  );
}

function BrandLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState(isMock ? "brand@nova.example.com" : "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isMock) { router.push("/brand"); return; }
    setLoading(true); setError("");
    try {
      const { createClient } = await import("@/supabase/client");
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(translateAuthError(authError.message)); setLoading(false); return; }
      const { data: userRow } = await supabase.from("users").select("role").eq("id", data.user.id).single();
      const role = userRow?.role ?? "brand";
      router.push(role === "admin" ? "/admin" : role === "brand" ? "/brand" : "/member");
      router.refresh();
    } catch { setError("로그인 중 오류가 발생했습니다."); setLoading(false); }
  }

  return (
    <Card className="max-w-md">
      <h2 className="text-2xl font-black">광고주 로그인</h2>
      <p className="mt-2 text-sm text-spread-ink/60">관리자 승인이 완료된 계정으로 로그인하세요.</p>
      {isMock && (
        <p className="mt-3 rounded-2xl border border-spread-point/30 bg-spread-point/10 px-4 py-3 text-xs font-semibold text-spread-point">
          Mock 모드 — 버튼을 누르면 바로 진입합니다.
        </p>
      )}
      <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <Field label="이메일">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="brand@company.com" required />
        </Field>
        {!isMock && (
          <Field label="비밀번호">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </Field>
        )}
        {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? "로그인 중..." : "로그인"}</Button>
      </form>
      <p className="mt-4 text-xs text-spread-ink/50">계정 문의: dypapa0309@gmail.com</p>
    </Card>
  );
}

function BrandSignupForm() {
  const [brandName, setBrandName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [registrationFile, setRegistrationFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxCeoName, setTaxCeoName] = useState("");
  const [taxBusinessType, setTaxBusinessType] = useState("");
  const [taxBusinessItem, setTaxBusinessItem] = useState("");
  const [taxEmail, setTaxEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const cooldown = useCooldown(60);

  if (isMock) {
    return (
      <Card className="max-w-md">
        <h2 className="text-2xl font-black">광고주 가입 신청</h2>
        <p className="mt-3 text-sm text-spread-ink/65">Mock 모드에서는 광고주 가입을 사용할 수 없습니다.</p>
        <LinkButton href="/brand" className="mt-5">Mock 모드로 입장</LinkButton>
      </Card>
    );
  }

  if (done) return <EmailConfirmCard email={email} type="brand" />;

  function formatBusinessNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirm) { setError("비밀번호가 일치하지 않습니다."); return; }
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 합니다."); return; }
    const rawBizNum = businessNumber.replace(/\D/g, "");
    if (rawBizNum.length !== 10) { setError("사업자등록번호 10자리를 입력해 주세요."); return; }
    setLoading(true); setError("");

    try {
      const { createClient } = await import("@/supabase/client");
      const supabase = createClient();

      let registrationUrl: string | null = null;
      if (registrationFile) {
        const ext = registrationFile.name.split(".").pop() ?? "pdf";
        const path = `brand-registrations/${Date.now()}-${rawBizNum}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("brand-docs").upload(path, registrationFile, { cacheControl: "3600", upsert: false });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("brand-docs").getPublicUrl(path);
          registrationUrl = urlData.publicUrl;
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { role: "brand", brand_name: brandName, contact_name: contactName, nickname: brandName, name: contactName }
        }
      });
      if (authError) {
        const msg = translateAuthError(authError.message);
        setError(msg);
        if (authError.message.includes("rate limit")) cooldown.start();
        setLoading(false); return;
      }

      const userId = authData.user?.id;
      if (!userId) { setError("계정 생성에 실패했습니다."); setLoading(false); return; }

      await supabase.from("users").upsert({ id: userId, role: "brand", name: contactName, nickname: brandName, email, bio: "", level: 1, score: 0, completed_missions: 0, status: "pending" });

      await supabase.from("brands").insert({
        name: brandName, description, website_url: websiteUrl, contact_name: contactName, contact_email: email, status: "pending",
        business_registration_number: rawBizNum, business_registration_url: registrationUrl,
        tax_invoice_enabled: taxEnabled,
        tax_invoice_info: taxEnabled ? { ceo_name: taxCeoName, business_type: taxBusinessType, business_item: taxBusinessItem, email: taxEmail, business_number: rawBizNum, company_name: brandName } : null,
        auth_user_id: userId
      });

      setDone(true);
    } catch { setError("가입 신청 중 오류가 발생했습니다."); setLoading(false); }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-black">브랜드 정보</h2>
          <div className="mt-5 grid gap-4">
            <Field label="브랜드명 / 상호"><Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="주식회사 ○○○" required /></Field>
            <Field label="홈페이지 URL"><Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." /></Field>
            <Field label="브랜드 소개"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="브랜드와 주요 제품/서비스를 간단히 소개해 주세요." /></Field>
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">담당자 / 로그인</h2>
          <div className="mt-5 grid gap-4">
            <Field label="담당자명"><Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="홍길동" required /></Field>
            <Field label="이메일 (로그인 ID)"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="brand@company.com" required /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="비밀번호"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6자 이상" required /></Field>
              <Field label="비밀번호 확인"><Input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="동일하게 입력" required /></Field>
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <h2 className="text-2xl font-black">사업자 정보</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="사업자등록번호" hint="000-00-00000 형식">
            <Input value={businessNumber} onChange={(e) => setBusinessNumber(formatBusinessNumber(e.target.value))} placeholder="000-00-00000" required />
          </Field>
          <Field label="사업자등록증 첨부" hint="PDF 또는 이미지 (선택)">
            <input type="file" accept=".pdf,image/*" onChange={(e) => setRegistrationFile(e.target.files?.[0] ?? null)} className="block w-full rounded-2xl border border-spread-ink/15 bg-spread-ink/[0.03] px-4 py-3 text-sm" />
          </Field>
        </div>
      </Card>
      <Card>
        <div className="flex items-start gap-3">
          <input type="checkbox" id="tax-toggle" checked={taxEnabled} onChange={(e) => setTaxEnabled(e.target.checked)} className="mt-1" />
          <label htmlFor="tax-toggle" className="cursor-pointer">
            <p className="font-black">세금계산서 발행 요청</p>
            <p className="mt-1 text-sm text-spread-ink/60">서비스 이용료에 대한 세금계산서를 받으실 경우 체크해 주세요.</p>
          </label>
        </div>
        {taxEnabled && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="대표자명"><Input value={taxCeoName} onChange={(e) => setTaxCeoName(e.target.value)} placeholder="홍길동" /></Field>
            <Field label="세금계산서 수신 이메일"><Input type="email" value={taxEmail} onChange={(e) => setTaxEmail(e.target.value)} placeholder="tax@company.com" /></Field>
            <Field label="업태"><Input value={taxBusinessType} onChange={(e) => setTaxBusinessType(e.target.value)} placeholder="서비스업" /></Field>
            <Field label="종목"><Input value={taxBusinessItem} onChange={(e) => setTaxBusinessItem(e.target.value)} placeholder="광고대행" /></Field>
            <p className="sm:col-span-2 text-xs text-spread-ink/50 rounded-2xl border border-spread-ink/10 px-4 py-3">사업자등록번호와 상호는 위에서 입력한 정보를 사용합니다.</p>
          </div>
        )}
      </Card>
      {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <Button type="submit" disabled={loading || cooldown.active}>
        {loading ? "신청 중..." : cooldown.active ? `잠시 후 다시 시도해 주세요 (${cooldown.remaining}초)` : "광고주 가입 신청"}
      </Button>
      <p className="text-center text-xs text-spread-ink/50">관리자 검토 후 승인됩니다. 영업일 1~3일 소요됩니다.</p>
    </form>
  );
}

// ─────────────────────────────────────────────
// 이메일 인증 안내 (공통)
// ─────────────────────────────────────────────
function EmailConfirmCard({ email, type }: { email: string; type: "member" | "brand" }) {
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);
  const cooldown = useCooldown(30);

  async function handleResend() {
    setResending(true);
    try {
      const { createClient } = await import("@/supabase/client");
      const supabase = createClient();
      await supabase.auth.resend({ type: "signup", email });
      setResent(true);
      cooldown.start();
    } finally { setResending(false); }
  }

  return (
    <Card className="mx-auto max-w-lg">
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-spread-point/10 text-3xl">✉️</div>
        <div>
          <h2 className="text-2xl font-black">인증 이메일을 보냈습니다</h2>
          <p className="mt-2 text-sm text-spread-ink/60"><strong className="text-spread-ink">{email}</strong>으로 발송했습니다</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {[
          "받은 편지함에서 SPREAD 인증 메일을 확인하세요",
          "메일 안의 '이메일 인증하기' 링크를 클릭하세요",
          type === "brand" ? "인증 완료 후 관리자가 사업자 정보를 검토합니다 (영업일 1~3일)" : "인증이 완료되면 자동으로 로그인됩니다"
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3 rounded-2xl border border-spread-ink/10 px-4 py-3 text-sm">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-spread-point text-xs font-black text-white">{i + 1}</span>
            <span className="leading-5">{step}</span>
          </div>
        ))}
      </div>
      {type === "brand" && (
        <p className="mt-4 rounded-2xl border border-spread-ink/10 px-4 py-3 text-xs text-spread-ink/60">
          승인 완료 시 <strong>{email}</strong>으로 안내 메일이 발송됩니다. 문의: dypapa0309@gmail.com
        </p>
      )}
      <div className="mt-5 border-t border-spread-ink/10 pt-5">
        <p className="text-center text-xs text-spread-ink/50">메일이 오지 않았나요? 스팸 폴더를 확인하거나 재발송해 주세요.</p>
        {resent ? (
          <p className="mt-3 text-center text-sm font-semibold text-spread-point">재발송했습니다. 잠시 후 확인해 주세요.</p>
        ) : (
          <button onClick={handleResend} disabled={resending || cooldown.active} className="mt-3 w-full rounded-2xl border border-spread-ink/15 py-3 text-sm font-semibold text-spread-ink/70 hover:bg-spread-ink/5 disabled:opacity-50">
            {resending ? "발송 중..." : cooldown.active ? `재발송 대기 (${cooldown.remaining}초)` : "인증 메일 재발송"}
          </button>
        )}
      </div>
    </Card>
  );
}
