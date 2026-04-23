"use client";

import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { money } from "@/lib/labels";
import type { User } from "@/types/spread";

export function MemberStatsModal({ user }: { user: User }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-spread-point bg-spread-point/10 text-spread-point transition hover:bg-spread-point hover:text-white"
        aria-label="내 성과 보기"
      >
        <AlertCircle size={19} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-spread-ink/20 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-spread-point">내 성과</p>
                <h2 className="mt-1 text-2xl font-black">{user.nickname}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-spread-ink/10"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 grid gap-3">
              <StatRow label="내 등급" value={`Lv.${user.level}`} caption="빠른 반응 기여자" />
              <StatRow label="누적 수익" value={money(user.totalEarnings)} caption="확정 지급 기준" />
              <StatRow label="누적 점수" value={`${user.score}점`} caption="승인/성과 반영" />
            </div>
            <Button className="mt-6 w-full" onClick={() => setOpen(false)}>
              확인
            </Button>
          </Card>
        </div>
      ) : null}
    </>
  );
}

function StatRow({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="rounded-2xl border border-spread-ink/10 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-spread-ink/60">{label}</p>
        <p className="text-xl font-black">{value}</p>
      </div>
      <p className="mt-1 text-xs text-spread-ink/55">{caption}</p>
    </div>
  );
}
