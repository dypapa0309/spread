"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { channelLabels, formatLabels, industryOptions, localCategoryOptions, productCategoryOptions } from "@/lib/labels";
import type { CampaignDraftPreset, ChannelType, ExperienceType, FormatType } from "@/types/spread";

const channels: ChannelType[] = ["threads", "x", "wordpress", "kakao"];
const formats: FormatType[] = ["one_line", "story", "comparison", "question", "recommendation", "debate"];

export function CampaignForm({ mode = "new" }: { mode?: "new" | "edit" }) {
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>(["threads"]);
  const [selectedFormats, setSelectedFormats] = useState<FormatType[]>(["one_line"]);
  const [experienceType, setExperienceType] = useState<ExperienceType>("product");
  const [presetTitle, setPresetTitle] = useState("");
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const presets: CampaignDraftPreset[] = [
    {
      sourceCampaignId: "camp-1",
      title: "Nova Desk 제품 배송 미션",
      experienceType: "product",
      industry: "디지털",
      category: "가전/디지털",
      offerTitle: "Nova Desk 스타터 키트",
      offerDescription: "협업 기록 앱 30일 이용권과 데스크 노트 키트를 제공합니다.",
      offerValueLabel: "제품 배송",
      channels: ["threads"],
      formats: ["one_line"],
      keyMessage: "Nova Desk는 작은 반응을 빠르게 만들 수 있다."
    },
    {
      sourceCampaignId: "camp-4",
      title: "성수 로스터리 방문 체험",
      experienceType: "local",
      industry: "푸드",
      category: "카페",
      offerTitle: "성수 로스터리 커피 페어링",
      offerDescription: "예약 시간에 방문해 시음과 원두 설명을 체험합니다.",
      offerValueLabel: "방문 체험",
      channels: ["kakao"],
      formats: ["recommendation"],
      keyMessage: "Mellow Bean은 작은 반응을 빠르게 만들 수 있다."
    }
  ];
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
          {mode === "new" ? (
            <FormSection title="이전 캠페인 불러오기">
              <Field label="복제할 캠페인">
                <Select
                  defaultValue=""
                  onChange={(event) => {
                    const preset = presets.find((item) => item.sourceCampaignId === event.target.value);
                    if (!preset) return;
                    setPresetTitle(`${preset.title} 복사본`);
                    setExperienceType(preset.experienceType);
                    setOfferTitle(preset.offerTitle);
                    setOfferDescription(preset.offerDescription);
                    setSelectedChannels(preset.channels);
                    setSelectedFormats(preset.formats);
                  }}
                >
                  <option value="">선택 안 함</option>
                  {presets.map((preset) => (
                    <option key={preset.sourceCampaignId} value={preset.sourceCampaignId}>{preset.title}</option>
                  ))}
                </Select>
              </Field>
              <p className="text-xs text-spread-ink/60">기본 정보와 가이드라인만 복사됩니다. 날짜, 모집 수, 대표 이미지는 새로 확인하세요.</p>
            </FormSection>
          ) : null}
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
              <Field label="캠페인명"><Input value={presetTitle} onChange={(event) => setPresetTitle(event.target.value)} placeholder="미션 이름" /></Field>
              <Field label="제품/서비스명"><Input placeholder="제품 또는 체험 서비스" /></Field>
            </div>
            <Field label="요약"><Input placeholder="카드에 보일 짧은 설명" /></Field>
            <Field label="설명"><Textarea placeholder="미션 목적과 기대 반응" /></Field>
          </FormSection>
          <FormSection title="체험상품">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="캠페인 타입">
                <Select value={experienceType} onChange={(event) => setExperienceType(event.target.value as ExperienceType)}>
                  <option value="product">제품 배송형</option>
                  <option value="local">지역 방문형</option>
                </Select>
              </Field>
              <Field label="업종">
                <Select defaultValue="푸드">
                  {industryOptions.map((industry) => <option key={industry} value={industry}>{industry}</option>)}
                </Select>
              </Field>
              <Field label="카테고리">
                <Select defaultValue={experienceType === "product" ? "식품" : "카페"}>
                  {(experienceType === "product" ? productCategoryOptions : localCategoryOptions).map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
              </Field>
            </div>
            {experienceType === "product" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="상품명"><Input value={offerTitle} onChange={(event) => setOfferTitle(event.target.value)} placeholder="샘플팩 / 이용권 / 키트" /></Field>
                <Field label="제공 방식"><Input placeholder="제품 배송" /></Field>
                <Field label="제공 구성"><Textarea value={offerDescription} onChange={(event) => setOfferDescription(event.target.value)} placeholder="선정자에게 제공되는 제품 구성과 배송 안내" /></Field>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="시/도"><Input placeholder="서울" /></Field>
                <Field label="시군구"><Input placeholder="성동구" /></Field>
                <Field label="장소명"><Input value={offerTitle} onChange={(event) => setOfferTitle(event.target.value)} placeholder="브랜드 쇼룸" /></Field>
                <Field label="방문 주소"><Input placeholder="도로명 주소" /></Field>
                <Field label="운영/예약 안내"><Textarea value={offerDescription} onChange={(event) => setOfferDescription(event.target.value)} placeholder="방문 가능 시간, 예약 방식, 주의사항" /></Field>
              </div>
            )}
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
          <FormSection title="모집 정책">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="모집 수"><Input type="number" placeholder="80" /></Field>
              <Field label="개인정보 보유일"><Input type="number" placeholder="30" /></Field>
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
              <Field label="콘텐츠 유지기간"><Input type="number" placeholder="6" /></Field>
              <Field label="최소 글자 수"><Input type="number" placeholder="80" /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="신청 마감"><Input type="datetime-local" /></Field>
              <Field label="제출 마감"><Input type="datetime-local" /></Field>
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
