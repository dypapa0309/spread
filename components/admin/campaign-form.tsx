"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { channelLabels, formatLabels } from "@/lib/labels";
import type { ChannelType, FormatType } from "@/types/spread";

const channels: ChannelType[] = ["threads", "x", "wordpress", "kakao"];
const formats: FormatType[] = ["one_line", "story", "comparison", "question", "recommendation", "debate"];

export function CampaignForm({ mode = "new" }: { mode?: "new" | "edit" }) {
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>(["threads"]);
  const [selectedFormats, setSelectedFormats] = useState<FormatType[]>(["one_line"]);
  const [coverImageUrl, setCoverImageUrl] = useState(
    mode === "edit"
      ? "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop"
      : ""
  );
  const [saved, setSaved] = useState(false);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.45fr]">
      <Card>
        <h1 className="text-3xl font-black">{mode === "new" ? "캠페인 생성" : "캠페인 수정"}</h1>
        <div className="mt-6 grid gap-6">
          <FormSection title="기본 정보">
            <Field label="대표 이미지">
              <div className="grid gap-3 sm:grid-cols-[1fr_1.2fr]">
                <label className="flex aspect-[16/10] cursor-pointer flex-col items-center justify-center gap-3 rounded-spread border border-spread-ink/15 bg-spread-ink/[0.03] text-center text-sm font-semibold transition hover:border-spread-point">
                  <ImagePlus className="text-spread-point" size={28} />
                  <span>이미지 업로드</span>
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) setCoverImageUrl(URL.createObjectURL(file));
                    }}
                  />
                </label>
                <div
                  className="aspect-[16/10] rounded-spread border border-spread-ink/10 bg-spread-ink/5 bg-cover bg-center"
                  style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})` } : undefined}
                >
                  {!coverImageUrl ? (
                    <div className="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-spread-ink/50">
                      카드와 상세 상단에 표시됩니다
                    </div>
                  ) : null}
                </div>
              </div>
            </Field>
            <Field label="대표 이미지 URL" hint="mock mode에서는 URL 또는 로컬 미리보기만 사용합니다. 실제 저장은 Supabase Storage로 연결합니다.">
              <Input value={coverImageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} placeholder="https://... 또는 Storage public URL" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="캠페인명"><Input defaultValue={mode === "edit" ? "Threads 한줄 반응 실험" : ""} placeholder="미션 이름" /></Field>
              <Field label="제품명"><Input placeholder="제품/서비스" /></Field>
            </div>
            <Field label="요약"><Input placeholder="카드에 보일 짧은 설명" /></Field>
            <Field label="설명"><Textarea placeholder="미션 목적과 기대 반응" /></Field>
          </FormSection>
          <FormSection title="채널 선택">
            <div className="flex flex-wrap gap-2">
              {channels.map((channel) => (
                <Chip key={channel} selected={selectedChannels.includes(channel)} onClick={() => toggle(channel, selectedChannels, setSelectedChannels)}>
                  {channelLabels[channel]}
                </Chip>
              ))}
            </div>
          </FormSection>
          <FormSection title="포맷 선택">
            <div className="flex flex-wrap gap-2">
              {formats.map((format) => (
                <Chip key={format} selected={selectedFormats.includes(format)} onClick={() => toggle(format, selectedFormats, setSelectedFormats)}>
                  {formatLabels[format]}
                </Chip>
              ))}
            </div>
          </FormSection>
          <FormSection title="가이드라인">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="핵심 메시지"><Input placeholder="반드시 남길 관점" /></Field>
              <Field label="필수 해시태그"><Input placeholder="#SPREAD, #미션" /></Field>
              <Field label="필수 포인트"><Textarea placeholder="줄바꿈으로 추가" /></Field>
              <Field label="금지 표현"><Textarea placeholder="무조건 최고, 100% 보장" /></Field>
            </div>
          </FormSection>
          <FormSection title="보상 정책">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="모집 수"><Input type="number" placeholder="80" /></Field>
              <Field label="기본 보상"><Input type="number" placeholder="12000" /></Field>
              <Field label="최대 보너스"><Input type="number" placeholder="18000" /></Field>
            </div>
          </FormSection>
          <FormSection title="검수 정책">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="검수 모드">
                <Select defaultValue="semi_auto">
                  <option value="manual">운영자 검수</option>
                  <option value="semi_auto">반자동</option>
                  <option value="auto">자동</option>
                </Select>
              </Field>
              <Field label="최소 유지 시간"><Input type="number" placeholder="24" /></Field>
              <Field label="최소 글자 수"><Input type="number" placeholder="80" /></Field>
            </div>
          </FormSection>
          <Button onClick={() => setSaved(true)}>저장</Button>
        </div>
      </Card>
      <Card className="self-start">
        <h2 className="text-xl font-black">설정 요약</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedChannels.map((channel) => <Badge key={channel} active>{channelLabels[channel]}</Badge>)}
          {selectedFormats.map((format) => <Badge key={format}>{formatLabels[format]}</Badge>)}
        </div>
        <div
          className="mt-5 aspect-[16/10] rounded-spread border border-spread-ink/10 bg-spread-ink/5 bg-cover bg-center"
          style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})` } : undefined}
        />
        {saved ? <p className="mt-4 rounded-2xl border border-spread-point bg-spread-point/10 p-3 text-sm font-semibold text-spread-point">저장되었습니다. mock mode에서는 화면 상태만 갱신됩니다.</p> : null}
      </Card>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 border-b border-spread-ink/10 pb-6 last:border-b-0">
      <h2 className="text-xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function toggle<T>(value: T, list: T[], setter: (value: T[]) => void) {
  setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
}
