// 클라이언트 컴포넌트에서 안전하게 import 가능한 순수 헬퍼 함수
// (서버 전용 모듈 의존성 없음)
import type { ApplicationStatus, ChannelType, SubmissionChecklistItem } from "@/types/spread";

export function getApplicationCta(status?: ApplicationStatus, hasPenalty = false) {
  if (hasPenalty) return { label: "사용 제한 중", href: "/member/profile", disabled: true };
  if (!status) return { label: "신청하기", href: "", disabled: false };
  if (status === "selected") return { label: "제출하기", href: "", disabled: false };
  if (status === "applied") return { label: "신청 검토 중", href: "/member/profile", disabled: true };
  if (status === "rejected") return { label: "선정되지 않음", href: "/member/profile", disabled: true };
  return { label: "신청 취소됨", href: "/member/profile", disabled: true };
}

export function getSubmissionChecklist(channelType: ChannelType): SubmissionChecklistItem[] {
  const common: SubmissionChecklistItem[] = [
    { id: "body", label: "본문을 붙여넣었습니다", required: true, channelTypes: ["threads", "x", "wordpress", "kakao"], checked: false },
    { id: "retention", label: "게시물 6개월 유지 조건을 확인했습니다", required: true, channelTypes: ["threads", "x", "wordpress", "kakao"], checked: false }
  ];

  if (channelType === "kakao") {
    return [
      { id: "screenshot", label: "KakaoTalk 피드 캡처를 준비했습니다", required: true, channelTypes: ["kakao"], checked: false },
      { id: "kakao-profile", label: "닉네임/친구수 인증 정보와 같은 계정입니다", required: true, channelTypes: ["kakao"], checked: false },
      ...common
    ];
  }

  return [
    { id: "url", label: "게시글 링크를 입력했습니다", required: true, channelTypes: ["threads", "x", "wordpress"], checked: false },
    { id: "public", label: "공개 게시물 상태를 확인했습니다", required: true, channelTypes: ["threads", "x", "wordpress"], checked: false },
    { id: "required-tags", label: "필수 해시태그/링크를 확인했습니다", required: true, channelTypes: ["threads", "x", "wordpress"], checked: false },
    ...common
  ];
}
