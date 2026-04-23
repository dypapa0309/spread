"use client";

import { useState } from "react";

export function PrivacyConsent({
  checked,
  onChange,
  variant
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  variant: "application" | "fulfillment";
}) {
  const [open, setOpen] = useState(false);
  const isFulfillment = variant === "fulfillment";

  return (
    <div className="rounded-spread border border-spread-ink/10 p-4">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          required
        />
        <span>
          <span className="block text-sm font-black">
            {isFulfillment ? "배송/방문 처리 개인정보 제공에 동의합니다" : "신청자 선정 및 캠페인 운영 개인정보 이용에 동의합니다"}
          </span>
          <span className="mt-1 block text-xs leading-5 text-spread-ink/60">
            동의 거부 시 {isFulfillment ? "제품 제공 또는 방문 체험 진행" : "캠페인 신청"}이 제한됩니다.
          </span>
        </span>
      </label>
      <button type="button" className="mt-3 text-xs font-bold text-spread-point" onClick={() => setOpen((prev) => !prev)}>
        {open ? "동의 내용 닫기" : "동의 내용 보기"}
      </button>
      {open ? (
        <div className="mt-3 grid gap-2 text-xs leading-5 text-spread-ink/65">
          <p>수집 목적: {isFulfillment ? "제품 배송, 방문 예약, 체험 진행 및 관련 문의 대응" : "신청자 선정, 캠페인 운영, 채널 적합성 확인"}</p>
          <p>수집 항목: {isFulfillment ? "이름, 휴대폰 번호, 주소 또는 방문 희망일/동반 인원/요청사항" : "닉네임, 채널 정보, 팔로워/친구수, 신청 메모"}</p>
          <p>제공받는 자: 해당 캠페인의 광고주 및 체험처, SPREAD 운영자</p>
          <p>보유 기간: 캠페인 종료 후 30일 보관 후 파기</p>
          <p>동의 거부 권리 및 불이익: 동의를 거부할 수 있으나 캠페인 참여 또는 체험 진행이 제한됩니다.</p>
        </div>
      ) : null}
    </div>
  );
}
