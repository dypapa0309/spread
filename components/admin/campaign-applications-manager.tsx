"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { applicationStatusLabels, channelLabels, shortDate } from "@/lib/labels";
import type { ApplicationStatus, CampaignApplicationView } from "@/types/spread";

export function CampaignApplicationsManager({ applications }: { applications: CampaignApplicationView[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [localStatus, setLocalStatus] = useState<Record<string, ApplicationStatus>>({});

  const rows = useMemo(
    () => applications.map((application) => ({ ...application, status: localStatus[application.id] ?? application.status })),
    [applications, localStatus]
  );

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function bulk(status: ApplicationStatus) {
    setLocalStatus((prev) => ({
      ...prev,
      ...Object.fromEntries(selectedIds.map((id) => [id, status]))
    }));
    setSelectedIds([]);
  }

  function downloadCsv() {
    const header = [
      "캠페인명",
      "신청자명",
      "닉네임",
      "이메일",
      "채널",
      "핸들",
      "채널 링크",
      "팔로워/친구수",
      "승인률",
      "현재 패널티",
      "신청 메모",
      "신청일",
      "상태"
    ];
    const body = rows.map((row) => [
      row.campaign.title,
      row.user.name,
      row.user.nickname,
      row.user.email,
      channelLabels[row.channelType],
      row.channel?.handle ?? "",
      row.channel?.channelUrl ?? row.channel?.verificationScreenshotUrl ?? "",
      String(row.channel?.friendCount ?? row.channel?.followerCount ?? 0),
      `${row.approvalRate}%`,
      row.activePenalty ? `${row.activePenalty.suspensionDays}일 제한` : "없음",
      row.message,
      shortDate(row.appliedAt),
      applicationStatusLabels[row.status]
    ]);
    const csv = [header, ...body].map((line) => line.map(csvCell).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${rows[0]?.campaign.slug ?? "campaign"}-applications.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">신청자 선정</h1>
          <p className="mt-2 text-sm text-spread-ink/60">체크 후 일괄 선정하거나 CSV로 내려받아 엑셀에서 검토합니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={downloadCsv}>CSV 다운로드</Button>
          <Button variant="outline" disabled={!selectedIds.length} onClick={() => bulk("rejected")}>선택 반려</Button>
          <Button disabled={!selectedIds.length} onClick={() => bulk("selected")}>선택 승인</Button>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[920px] border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs text-spread-ink/55">
            <tr>
              <th className="px-3 py-2">선택</th>
              <th className="px-3 py-2">신청자</th>
              <th className="px-3 py-2">채널</th>
              <th className="px-3 py-2">링크/캡처</th>
              <th className="px-3 py-2">규모</th>
              <th className="px-3 py-2">승인률</th>
              <th className="px-3 py-2">패널티</th>
              <th className="px-3 py-2">메모</th>
              <th className="px-3 py-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="rounded-2xl bg-spread-ink/[0.03]">
                <td className="rounded-l-2xl px-3 py-3">
                  <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggle(row.id)} />
                </td>
                <td className="px-3 py-3">
                  <p className="font-black">{row.user.nickname}</p>
                  <p className="text-xs text-spread-ink/55">{row.user.email}</p>
                </td>
                <td className="px-3 py-3">{channelLabels[row.channelType]}</td>
                <td className="px-3 py-3">
                  {row.channel?.channelUrl ? <a className="font-semibold text-spread-point" href={row.channel.channelUrl}>링크</a> : row.channel?.verificationScreenshotUrl ? <span>캡처</span> : <span>없음</span>}
                </td>
                <td className="px-3 py-3">{(row.channel?.friendCount ?? row.channel?.followerCount ?? 0).toLocaleString()}명</td>
                <td className="px-3 py-3">{row.approvalRate}%</td>
                <td className="px-3 py-3">{row.activePenalty ? `${row.activePenalty.suspensionDays}일` : "없음"}</td>
                <td className="max-w-52 px-3 py-3 text-spread-ink/65">{row.message}</td>
                <td className="rounded-r-2xl px-3 py-3"><Badge active={row.status === "selected"}>{applicationStatusLabels[row.status]}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}
