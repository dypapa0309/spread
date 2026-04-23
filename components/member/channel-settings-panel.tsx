"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { uploadChannelVerificationImage } from "@/services/channel-assets";
import type { ChannelType, UserChannel } from "@/types/spread";

export function ChannelSettingsPanel({ channels = [] }: { channels?: UserChannel[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [channelType, setChannelType] = useState<ChannelType>("threads");
  const current = channels.find((channel) => channel.channelType === channelType);
  const [handle, setHandle] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [friendCount, setFriendCount] = useState("");
  const [verificationScreenshotUrl, setVerificationScreenshotUrl] = useState("");
  const [verificationScreenshotFile, setVerificationScreenshotFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function hydrate(nextChannelType: ChannelType) {
    const next = channels.find((channel) => channel.channelType === nextChannelType);
    setChannelType(nextChannelType);
    setHandle(next?.handle ?? "");
    setChannelUrl(next?.channelUrl ?? "");
    setFollowerCount(next?.followerCount ? String(next.followerCount) : "");
    setFriendCount(next?.friendCount ? String(next.friendCount) : "");
    setVerificationScreenshotUrl(next?.verificationScreenshotUrl ?? "");
    setVerificationScreenshotFile(null);
    setMessage("");
  }

  async function saveChannel() {
    setSaving(true);
    setMessage("");
    try {
      let nextVerificationScreenshotUrl = verificationScreenshotUrl;
      if (verificationScreenshotFile) {
        nextVerificationScreenshotUrl = await uploadChannelVerificationImage(verificationScreenshotFile, `user-channel/${channelType}`);
      }

      const response = await fetch("/api/user-channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelType,
          handle,
          channelUrl,
          followerCount: Number(followerCount) || 0,
          friendCount: Number(friendCount) || 0,
          verificationScreenshotUrl: nextVerificationScreenshotUrl
        })
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      setMessage(result.message ?? (result.ok ? "저장되었습니다." : "저장에 실패했습니다."));
      if (response.ok && result.ok) {
        setVerificationScreenshotUrl(nextVerificationScreenshotUrl);
        setVerificationScreenshotFile(null);
        router.refresh();
      }
    } catch {
      setMessage("채널 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => { hydrate(channelType); setOpen(true); }}>
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
                  <Select value={channelType} onChange={(event) => hydrate(event.target.value as ChannelType)}>
                    <option value="threads">Threads</option>
                    <option value="x">X</option>
                    <option value="wordpress">WordPress</option>
                    <option value="kakao">KakaoTalk</option>
                  </Select>
                </Field>
                <Field label="닉네임/핸들">
                  <Input value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="@spread_sia 또는 카카오 닉네임" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={channelType === "kakao" ? "채널 링크" : "채널 링크"}>
                  <Input value={channelUrl} onChange={(event) => setChannelUrl(event.target.value)} placeholder="KakaoTalk은 비워둘 수 있습니다." disabled={channelType === "kakao"} />
                </Field>
                <Field label={channelType === "kakao" ? "친구수" : "팔로워수"}>
                  <Input
                    type="number"
                    value={channelType === "kakao" ? friendCount : followerCount}
                    onChange={(event) => channelType === "kakao" ? setFriendCount(event.target.value) : setFollowerCount(event.target.value)}
                    placeholder="900"
                  />
                </Field>
              </div>
              <Field
                label={channelType === "kakao" ? "카카오 프로필 캡처" : "인증 캡처"}
                hint={channelType === "kakao" ? "내 아이디/닉네임과 친구수가 함께 보이는 캡처 이미지를 등록해 주세요." : "필요한 경우 채널 인증 캡처를 함께 보관할 수 있습니다."}
              >
                <div className="grid gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setVerificationScreenshotFile(event.target.files?.[0] ?? null)}
                    className="block w-full rounded-2xl border border-spread-ink/15 bg-spread-ink/[0.03] px-4 py-3 text-sm"
                  />
                  {verificationScreenshotUrl ? (
                    <p className="text-xs text-spread-ink/55">등록된 캡처가 있습니다.</p>
                  ) : null}
                </div>
              </Field>
              {current ? (
                <p className="rounded-2xl border border-spread-ink/10 px-4 py-3 text-xs text-spread-ink/60">
                  기존 {current.handle} 정보를 수정합니다.
                </p>
              ) : null}
              {message ? (
                <p className="rounded-2xl border border-spread-point/30 bg-spread-point/10 px-4 py-3 text-sm font-semibold text-spread-point">{message}</p>
              ) : null}
              <Button onClick={saveChannel} disabled={saving}>{saving ? "저장 중..." : "저장"}</Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
