"use client";

import { useState } from "react";
import { Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";

export function ChannelSettingsPanel() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Settings size={18} />
        설정
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-spread-ink/20 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-spread-point">Channel</p>
                <h2 className="mt-1 text-2xl font-black">채널 등록/수정</h2>
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
            <div className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="채널">
                  <Select defaultValue="threads">
                    <option value="threads">Threads</option>
                    <option value="x">X</option>
                    <option value="wordpress">WordPress</option>
                    <option value="kakao">KakaoTalk</option>
                  </Select>
                </Field>
                <Field label="닉네임/핸들">
                  <Input placeholder="@spread_sia 또는 카카오 닉네임" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="채널 링크">
                  <Input placeholder="KakaoTalk은 비워둘 수 있습니다." />
                </Field>
                <Field label="팔로워/친구수">
                  <Input type="number" placeholder="900" />
                </Field>
              </div>
              <Field label="인증 캡처 URL" hint="KakaoTalk은 내 아이디/닉네임과 친구수가 보이는 캡처가 필수입니다.">
                <Input placeholder="/storage/channel-verifications/profile.png" />
              </Field>
              <Button onClick={() => setOpen(false)}>저장</Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
