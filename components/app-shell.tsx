import Link from "next/link";
import type { ReactNode } from "react";
import { LinkButton } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";

const memberNav = [
  ["홈", "/member"],
  ["SPREAD?", "/about"],
  ["캠페인", "/member/campaigns"],
  ["제출", "/member/submissions"],
  ["프로필", "/member/profile"]
];

const adminNav = [
  ["대시보드", "/admin"],
  ["캠페인", "/admin/campaigns"],
  ["제출물", "/admin/submissions"]
];

const brandNav = [
  ["대시보드", "/brand"],
  ["캠페인", "/brand/campaigns"]
];

export function AppShell({ children, role = "member" }: { children: ReactNode; role?: "member" | "admin" | "brand" | "public" }) {
  const nav = role === "admin" ? adminNav : role === "brand" ? brandNav : memberNav;

  return (
    <div className="min-h-screen bg-spread-bg text-spread-ink">
      <header className="sticky top-0 z-20 border-b border-spread-ink/10 bg-spread-bg/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href={role === "member" ? "/member" : role === "admin" ? "/admin" : role === "brand" ? "/brand" : "/"}
            className="text-lg font-black tracking-normal"
          >
            SPREAD
          </Link>
          {role === "public" ? (
            <nav className="hidden items-center gap-1 sm:flex">
              <Link href="/about" className="rounded-full px-3 py-2 text-sm font-semibold hover:bg-spread-ink/5">
                SPREAD?
              </Link>
            </nav>
          ) : (
            <nav className="hidden items-center gap-1 sm:flex">
              {nav.map(([label, href]) => (
                <Link key={href} href={href} className="rounded-full px-3 py-2 text-sm font-semibold hover:bg-spread-ink/5">
                  {label}
                </Link>
              ))}
            </nav>
          )}
          <div className="flex items-center gap-2">
            {role === "admin" ? <LinkButton href="/member" variant="outline">멤버 보기</LinkButton> : null}
            {role === "brand" ? <LinkButton href="/member" variant="outline">사용자 보기</LinkButton> : null}
            {role !== "public" ? <LogoutButton /> : null}
          </div>
        </div>
        {role !== "public" ? (
          <nav className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 pb-3 sm:hidden">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="whitespace-nowrap rounded-full border border-spread-ink/10 px-3 py-2 text-sm font-semibold">
                {label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
      {children}
      {role === "public" ? (
        <footer className="mx-auto grid w-full max-w-6xl gap-6 border-t border-spread-ink/10 px-4 py-8 text-xs text-spread-ink/55 sm:px-6">
          <div className="grid gap-5 md:grid-cols-[1fr_1.2fr_0.8fr]">
            <div>
              <p className="text-sm font-black text-spread-ink">SPREAD</p>
              <p className="mt-2 leading-5">반응을 퍼뜨리고 전환을 만드는 미션 플랫폼</p>
            </div>
            <div className="grid gap-1 leading-5">
              <p>상호명: 이상한회사</p>
              <p>대표: 이상빈 · 사업자등록번호: 876-28-01550</p>
              <p>주소: 상동로 87 가나베스트타운 803-102호</p>
              <p>개인정보보호책임자: dypapa0309@gmail.com</p>
            </div>
            <div className="grid content-start gap-2 md:text-right">
              <a href="mailto:dypapa0309@gmail.com">dypapa0309@gmail.com</a>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link href="/terms">이용약관</Link>
                <Link href="/privacy">개인정보처리방침</Link>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-spread-ink/10 pt-4">
            <span>© SPREAD. All rights reserved.</span>
            <Link href="/admin" className="text-spread-ink/35">관리자 로그인</Link>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
