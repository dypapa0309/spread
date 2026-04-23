"use client";

import { useState, useTransition, type FormEvent } from "react";
import { ImagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { channelLabels, formatLabels, industryOptions, localCategoryOptions, productCategoryOptions } from "@/lib/labels";
import { uploadCampaignCoverImage } from "@/services/campaign-assets";
import type { SaveCampaignInput, SaveCampaignResult } from "@/services/campaign-write-service";
import type { CampaignDraftPreset, CampaignView, ChannelType, ExperienceType, FormatType, Industry, ReviewMode } from "@/types/spread";

const channels: ChannelType[] = ["threads", "x", "wordpress", "kakao"];
const formats: FormatType[] = ["one_line", "story", "comparison", "question", "recommendation", "debate"];

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

export function CampaignForm({ mode = "new", initialCampaign }: { mode?: "new" | "edit"; initialCampaign?: CampaignView }) {
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>(initialCampaign?.channels ?? ["threads"]);
  const [selectedFormats, setSelectedFormats] = useState<FormatType[]>(initialCampaign?.formats.length ? initialCampaign.formats : ["one_line"]);
  const [experienceType, setExperienceType] = useState<ExperienceType>(initialCampaign?.experienceType ?? "product");
  const [industry, setIndustry] = useState<Industry>(initialCampaign?.industry ?? "푸드");
  const [category, setCategory] = useState<string>(initialCampaign?.category ?? "식품");
  const [title, setTitle] = useState(initialCampaign?.title ?? "");
  const [productName, setProductName] = useState(initialCampaign?.productName ?? "");
  const [summary, setSummary] = useState(initialCampaign?.summary ?? "");
  const [description, setDescription] = useState(initialCampaign?.description ?? "");
  const [offerTitle, setOfferTitle] = useState(initialCampaign?.offerTitle ?? "");
  const [offerDescription, setOfferDescription] = useState(initialCampaign?.offerDescription ?? "");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialCampaign?.coverImageUrl ?? ""
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isPending, startTransition] = useTransition();

  function applyPreset(sourceCampaignId: string) {
    const preset = presets.find((p) => p.sourceCampaignId === sourceCampaignId);
    if (!preset) return;
    setTitle(`${preset.title} 복사본`);
    setExperienceType(preset.experienceType);
    setOfferTitle(preset.offerTitle);
    setOfferDescription(preset.offerDescription);
    setSelectedChannels(preset.channels);
    setSelectedFormats(preset.formats.length ? preset.formats : ["one_line"]);
    setIndustry(preset.industry);
    setCategory(preset.category);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage("");
    setSaveError("");

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        let nextCoverImageUrl = coverImageUrl;
        if (coverImageFile) {
          nextCoverImageUrl = await uploadCampaignCoverImage(coverImageFile);
          setCoverImageUrl(nextCoverImageUrl);
        }

        const payload: SaveCampaignInput = {
          title,
          productName,
          summary,
          description,
          coverImageUrl: nextCoverImageUrl.startsWith("blob:") ? "" : nextCoverImageUrl,
          experienceType,
          industry,
          category,
          offerTitle,
          offerDescription,
          offerValueLabel: readString(formData, "offerValueLabel") || (experienceType === "product" ? "제품 배송" : "방문 체험"),
          regionProvince: readString(formData, "regionProvince"),
          regionDistrict: readString(formData, "regionDistrict"),
          venueAddress: readString(formData, "venueAddress"),
          venueName: readString(formData, "venueName") || offerTitle,
          channels: selectedChannels,
          formats: selectedFormats,
          keyMessage: readString(formData, "keyMessage"),
          requiredHashtags: splitList(readString(formData, "requiredHashtags")),
          requiredPoints: splitList(readString(formData, "requiredPoints")),
          prohibitedExpressions: splitList(readString(formData, "prohibitedExpressions")),
          recruitLimit: readNumber(formData, "recruitLimit"),
          privacyRetentionDays: readNumber(formData, "privacyRetentionDays"),
          applyEndAt: readString(formData, "applyEndAt"),
          submissionDueAt: readString(formData, "submissionDueAt"),
          reviewMode: readString(formData, "reviewMode", "semi_auto") as ReviewMode,
          contentRetentionMonths: readNumber(formData, "contentRetentionMonths"),
          minTextLength: readNumber(formData, "minTextLength")
        };

        const response = await fetch(initialCampaign ? `/api/campaigns/${initialCampaign.id}` : "/api/campaigns", {
          method: initialCampaign ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = (await response.json()) as SaveCampaignResult;

        if (!result.ok) {
          setSaveError(result.message);
          return;
        }

        setSaveMessage(`${initialCampaign ? "수정" : "저장"}되었습니다. 캠페인 ID: ${result.campaignId}`);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* ── 메인 폼 ── */}
      <form className="grid gap-5" onSubmit={handleSubmit}>

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
                    if (file) {
                      setCoverImageFile(file);
                      setCoverImageUrl(URL.createObjectURL(file));
                    }
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
                <Select
                  value={experienceType}
                  onChange={(e) => {
                    const next = e.target.value as ExperienceType;
                    setExperienceType(next);
                    setCategory(next === "product" ? "식품" : "카페");
                  }}
                >
                  <option value="product">제품 배송형</option>
                  <option value="local">지역 방문형</option>
                </Select>
              </Field>
              <Field label="업종">
                <Select value={industry} onChange={(e) => setIndustry(e.target.value as Industry)}>
                  {industryOptions.map((v) => <option key={v} value={v}>{v}</option>)}
                </Select>
              </Field>
              <Field label="카테고리">
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
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
                  <Input name="offerValueLabel" defaultValue={initialCampaign?.offerValueLabel ?? ""} placeholder="제품 배송" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="제공 구성">
                    <Textarea value={offerDescription} onChange={(e) => setOfferDescription(e.target.value)} placeholder="선정자에게 제공되는 제품 구성 및 배송 안내" />
                  </Field>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="시/도"><Input name="regionProvince" defaultValue={initialCampaign?.regionProvince ?? ""} placeholder="서울" /></Field>
                <Field label="시군구"><Input name="regionDistrict" defaultValue={initialCampaign?.regionDistrict ?? ""} placeholder="성동구" /></Field>
                <Field label="장소명">
                  <Input name="venueName" value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} placeholder="브랜드 쇼룸" />
                </Field>
                <Field label="방문 주소"><Input name="venueAddress" defaultValue={initialCampaign?.venueAddress ?? ""} placeholder="도로명 주소" /></Field>
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

        {/* 포맷 선택 */}
        <Card>
          <SectionTitle>포맷 선택</SectionTitle>
          <p className="mt-1 text-sm text-spread-ink/55">참여자가 작성할 콘텐츠 포맷을 선택하세요.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {formats.map((format) => (
              <Chip key={format} selected={selectedFormats.includes(format)} onClick={() => toggle(format, selectedFormats, setSelectedFormats)}>
                {formatLabels[format]}
              </Chip>
            ))}
          </div>
        </Card>

        {/* 가이드라인 */}
        <Card>
          <SectionTitle>가이드라인</SectionTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="핵심 메시지"><Input name="keyMessage" defaultValue={initialCampaign?.guideline.keyMessage ?? ""} placeholder="반드시 남길 관점이나 문구" /></Field>
            <Field label="필수 해시태그"><Input name="requiredHashtags" defaultValue={initialCampaign?.guideline.requiredHashtags.join(", ") ?? ""} placeholder="#브랜드명, #캠페인태그" /></Field>
            <Field label="필수 포인트">
              <Textarea name="requiredPoints" defaultValue={initialCampaign?.guideline.requiredPoints.join("\n") ?? ""} placeholder="한 줄에 하나씩 입력&#10;예) 실제 사용 상황 포함&#10;예) 추천 대상 명시" />
            </Field>
            <Field label="금지 표현">
              <Textarea name="prohibitedExpressions" defaultValue={initialCampaign?.guideline.prohibitedExpressions.join("\n") ?? ""} placeholder="한 줄에 하나씩 입력&#10;예) 무조건 최고&#10;예) 100% 보장" />
            </Field>
          </div>
        </Card>

        {/* 모집 & 일정 */}
        <Card>
          <SectionTitle>모집 & 일정</SectionTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="모집 인원"><Input name="recruitLimit" type="number" defaultValue={initialCampaign?.recruitLimit ?? ""} placeholder="80" /></Field>
            <Field label="개인정보 보유일 (일)"><Input name="privacyRetentionDays" type="number" defaultValue={initialCampaign?.privacyRetentionDays ?? ""} placeholder="180" /></Field>
            <Field label="신청 마감"><Input name="applyEndAt" type="datetime-local" defaultValue={toDatetimeLocal(initialCampaign?.applyEndAt)} /></Field>
            <Field label="제출 마감"><Input name="submissionDueAt" type="datetime-local" defaultValue={toDatetimeLocal(initialCampaign?.submissionDueAt)} /></Field>
          </div>
        </Card>

        {/* 검수 정책 */}
        <Card>
          <SectionTitle>검수 정책</SectionTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="검수 모드">
              <Select name="reviewMode" defaultValue={initialCampaign?.reviewMode ?? "semi_auto"}>
                <option value="manual">운영자 검수</option>
                <option value="semi_auto">반자동</option>
                <option value="auto">자동</option>
              </Select>
            </Field>
            <Field label="콘텐츠 유지기간 (개월)"><Input name="contentRetentionMonths" type="number" defaultValue={initialCampaign?.guideline.contentRetentionMonths ?? ""} placeholder="6" /></Field>
            <Field label="최소 글자 수"><Input name="minTextLength" type="number" defaultValue={initialCampaign?.guideline.minTextLength ?? ""} placeholder="80" /></Field>
          </div>
        </Card>

        <Button type="submit" disabled={isPending}>{isPending ? "저장 중..." : "저장"}</Button>
        {saveMessage && (
          <p className="rounded-2xl border border-spread-point bg-spread-point/10 p-3 text-center text-sm font-semibold text-spread-point">
            {saveMessage}
          </p>
        )}
        {saveError && (
          <p className="rounded-2xl border border-spread-ink/20 bg-spread-ink/5 p-3 text-center text-sm font-semibold text-spread-ink">
            {saveError}
          </p>
        )}
      </form>

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
          <Card>
            <p className="text-xs font-black uppercase tracking-wider text-spread-ink/50">선택 포맷</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedFormats.length > 0
                ? selectedFormats.map((format) => <Badge key={format}>{formatLabels[format]}</Badge>)
                : <span className="text-xs text-spread-ink/40">포맷을 선택하세요</span>}
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

function readString(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? fallback).trim();
}

function readNumber(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return Number.NaN;
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

function splitList(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toDatetimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
