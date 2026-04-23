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
        <footer className="mx-auto flex w-full max-w-6xl justify-end px-4 pb-6 text-xs text-spread-ink/45 sm:px-6">
          <Link href="/admin">운영자</Link>
        </footer>
      ) : null}
    </div>
  );
}
