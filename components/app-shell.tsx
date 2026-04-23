import Link from "next/link";
import type { ReactNode } from "react";
import { LinkButton } from "@/components/ui/button";

const memberNav = [
  ["홈", "/member"],
  ["캠페인", "/member/campaigns"],
  ["제출", "/member/submissions"],
  ["마이", "/member/profile"]
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
          <Link href="/" className="text-lg font-black tracking-normal">
            SPREAD
          </Link>
          {role !== "public" ? (
            <nav className="hidden items-center gap-1 sm:flex">
              {nav.map(([label, href]) => (
                <Link key={href} href={href} className="rounded-full px-3 py-2 text-sm font-semibold hover:bg-spread-ink/5">
                  {label}
                </Link>
              ))}
            </nav>
          ) : null}
          <div className="flex items-center gap-2">
            {role === "admin" ? <LinkButton href="/member" variant="outline">멤버 보기</LinkButton> : null}
            {role === "brand" ? <LinkButton href="/member" variant="outline">사용자 보기</LinkButton> : null}
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
              <p>상호명: 주식회사 스프레드</p>
              <p>대표: 홍길동 · 사업자등록번호: 000-00-00000</p>
              <p>통신판매업신고번호: 제0000-서울강남-0000호</p>
              <p>주소: 서울특별시 강남구 테헤란로 000</p>
              <p>개인정보보호책임자: privacy@spread.local</p>
            </div>
            <div className="grid content-start gap-2 md:text-right">
              <Link href="/login" className="font-semibold text-spread-ink">사용자/광고주 로그인</Link>
              <a href="mailto:hello@spread.local">hello@spread.local</a>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <a href="#">이용약관</a>
                <a href="#">개인정보처리방침</a>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-spread-ink/10 pt-4">
            <span>© SPREAD. All rights reserved.</span>
            <Link href="/admin" className="text-spread-ink/35">운영자</Link>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
