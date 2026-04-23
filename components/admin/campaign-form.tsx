"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { channelLabels, industryOptions, localCategoryOptions, productCategoryOptions } from "@/lib/labels";
import type { CampaignDraftPreset, ChannelType, ExperienceType } from "@/types/spread";

const channels: ChannelType[] = ["threads", "x", "wordpress", "kakao"];

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
    formats: [],
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
    formats: [],
    keyMessage: "Mellow Bean은 작은 반응을 빠르게 만들 수 있다."
  }
];

export function CampaignForm({ mode = "new" }: { mode?: "new" | "edit" }) {
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>(["threads"]);
  const [experienceType, setExperienceType] = useState<ExperienceType>("product");
  const [title, setTitle] = useState("");
  const [productName, setProductName] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState(
    mode === "edit" ? "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop" : ""
  );
  const [saved, setSaved] = useState(false);

  function applyPreset(sourceCampaignId: string) {
    const preset = presets.find((p) => p.sourceCampaignId === sourceCampaignId);
    if (!preset) return;
    setTitle(`${preset.title} 복사본`);
    setExperienceType(preset.experienceType);
    setOfferTitle(preset.offerTitle);
    setOfferDescription(preset.offerDescription);
    setSelectedChannels(preset.channels);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* ── 메인 폼 ── */}
      <div className="grid gap-5">

        {/* 이전 캠페인 불러오기 */}
        {mode === "new" && (
          <Card>
            <SectionTitle>이전 캠페인 불러오기</SectionTitle>
            <div className="mt-4 grid gap-2">
              <Field label="복제할 캠페인">
                <Select defaultValue="" onChange={(e) => applyPreset(e.target.value)}>
                  <option value="">선택 안 함</option>
                  {presets.map((p) => (
                    <option key={p.sourceCampaignId} value={p.sourceCampaignId}>{p.title}</option>
                  ))}
                </Select>
              </Field>
              <p className="text-xs text-spread-ink/55">기본 정보와 가이드라인만 복사됩니다. 날짜·모집 수·이미지는 새로 입력하세요.</p>
            </div>
          </Card>
        )}

        {/* 기본 정보 */}
        <Card>
          <SectionTitle>기본 정보</SectionTitle>
          <div className="mt-4 grid gap-4">
            {/* 이미지 업로드 */}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-spread-ink/20 bg-spread-ink/[0.02] text-sm font-semibold transition hover:border-spread-point hover:bg-spread-point/5">
                <ImagePlus className="text-spread-point" size={24} />
                <span>이미지 업로드</span>
                <span className="text-xs font-normal text-spread-ink/50">또는 아래에 URL 직접 입력</span>
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setCoverImageUrl(URL.createObjectURL(file));
                  }}
                />
              </label>
              <div
                className="aspect-video rounded-2xl border border-spread-ink/10 bg-spread-ink/5 bg-cover bg-center"
                style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})` } : undefined}
              >
                {!coverImageUrl && (
                  <div className="flex h-full items-center justify-center text-xs text-spread-ink/40">미리보기</div>
                )}
              </div>
            </div>
            <Field label="이미지 URL">
              <Input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://..." />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="캠페인명">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="캠페인 이름" />
              </Field>
              <Field label="제품/서비스명">
                <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="제품 또는 서비스" />
              </Field>
            </div>
            <Field label="한줄 요약">
              <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="캠페인 카드에 표시되는 짧은 설명" />
            </Field>
            <Field label="상세 설명">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="미션 목적, 체험 내용, 기대 반응 등" />
            </Field>
          </div>
        </Card>

        {/* 체험 상품 */}
        <Card>
          <SectionTitle>체험 상품</SectionTitle>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="캠페인 타입">
                <Select value={experienceType} onChange={(e) => setExperienceType(e.target.value as ExperienceType)}>
                  <option value="product">제품 배송형</option>
                  <option value="local">지역 방문형</option>
                </Select>
              </Field>
              <Field label="업종">
                <Select defaultValue="푸드">
                  {industryOptions.map((v) => <option key={v} value={v}>{v}</option>)}
                </Select>
              </Field>
              <Field label="카테고리">
                <Select defaultValue={experienceType === "product" ? "식품" : "카페"}>
                  {(experienceType === "product" ? productCategoryOptions : localCategoryOptions).map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </Select>
              </Field>
            </div>

            {experienceType === "product" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="상품명">
                  <Input value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} placeholder="샘플팩 / 이용권 / 키트" />
                </Field>
                <Field label="제공 방식">
                  <Input placeholder="제품 배송" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="제공 구성">
                    <Textarea value={offerDescription} onChange={(e) => setOfferDescription(e.target.value)} placeholder="선정자에게 제공되는 제품 구성 및 배송 안내" />
                  </Field>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="시/도"><Input placeholder="서울" /></Field>
                <Field label="시군구"><Input placeholder="성동구" /></Field>
                <Field label="장소명">
                  <Input value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} placeholder="브랜드 쇼룸" />
                </Field>
                <Field label="방문 주소"><Input placeholder="도로명 주소" /></Field>
                <div className="sm:col-span-2">
                  <Field label="운영/예약 안내">
                    <Textarea value={offerDescription} onChange={(e) => setOfferDescription(e.target.value)} placeholder="방문 가능 시간, 예약 방식, 주의사항" />
                  </Field>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 채널 선택 */}
        <Card>
          <SectionTitle>채널 선택</SectionTitle>
          <p className="mt-1 text-sm text-spread-ink/55">리뷰를 받을 채널을 선택하세요. 복수 선택 가능합니다.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {channels.map((ch) => (
              <Chip key={ch} selected={selectedChannels.includes(ch)} onClick={() => toggle(ch, selectedChannels, setSelectedChannels)}>
                {channelLabels[ch]}
              </Chip>
            ))}
          </div>
        </Card>

        {/* 가이드라인 */}
        <Card>
          <SectionTitle>가이드라인</SectionTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="핵심 메시지"><Input placeholder="반드시 남길 관점이나 문구" /></Field>
            <Field label="필수 해시태그"><Input placeholder="#브랜드명, #캠페인태그" /></Field>
            <Field label="필수 포인트">
              <Textarea placeholder="한 줄에 하나씩 입력&#10;예) 실제 사용 상황 포함&#10;예) 추천 대상 명시" />
            </Field>
            <Field label="금지 표현">
              <Textarea placeholder="한 줄에 하나씩 입력&#10;예) 무조건 최고&#10;예) 100% 보장" />
            </Field>
          </div>
        </Card>

        {/* 모집 & 일정 */}
        <Card>
          <SectionTitle>모집 & 일정</SectionTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="모집 인원"><Input type="number" placeholder="80" /></Field>
            <Field label="개인정보 보유일 (일)"><Input type="number" placeholder="30" /></Field>
            <Field label="신청 마감"><Input type="datetime-local" /></Field>
            <Field label="제출 마감"><Input type="datetime-local" /></Field>
          </div>
        </Card>

        {/* 검수 정책 */}
        <Card>
          <SectionTitle>검수 정책</SectionTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="검수 모드">
              <Select defaultValue="semi_auto">
                <option value="manual">운영자 검수</option>
                <option value="semi_auto">반자동</option>
                <option value="auto">자동</option>
              </Select>
            </Field>
            <Field label="콘텐츠 유지기간 (개월)"><Input type="number" placeholder="6" /></Field>
            <Field label="최소 글자 수"><Input type="number" placeholder="80" /></Field>
          </div>
        </Card>

        <Button onClick={() => setSaved(true)}>저장</Button>
        {saved && (
          <p className="rounded-2xl border border-spread-point bg-spread-point/10 p-3 text-center text-sm font-semibold text-spread-point">
            저장되었습니다.
          </p>
        )}
      </div>

      {/* ── 사이드바 요약 ── */}
      <div className="hidden lg:block">
        <div className="sticky top-24 grid gap-4">
          <Card>
            <p className="text-xs font-black uppercase tracking-wider text-spread-ink/50">미리보기</p>
            <div
              className="mt-3 aspect-video rounded-2xl border border-spread-ink/10 bg-spread-ink/5 bg-cover bg-center"
              style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})` } : undefined}
            >
              {!coverImageUrl && <div className="flex h-full items-center justify-center text-xs text-spread-ink/40">이미지 없음</div>}
            </div>
            {title && <p className="mt-3 font-black leading-snug">{title}</p>}
            {summary && <p className="mt-1 text-xs text-spread-ink/60 leading-5">{summary}</p>}
          </Card>
          <Card>
            <p className="text-xs font-black uppercase tracking-wider text-spread-ink/50">선택 채널</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedChannels.length > 0
                ? selectedChannels.map((ch) => <Badge key={ch} active>{channelLabels[ch]}</Badge>)
                : <span className="text-xs text-spread-ink/40">채널을 선택하세요</span>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-black">{children}</h2>;
}

function toggle<T>(value: T, list: T[], setter: (value: T[]) => void) {
  setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
}
