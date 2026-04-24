import type { ApplicationStatus, CampaignStatus, ChannelType, ExperienceType, Industry, ReviewMode, SubmissionStatus, VerificationStatus } from "@/types/spread";

export const channelLabels: Record<ChannelType, string> = {
  threads: "Threads",
  x: "X",
  wordpress: "WordPress",
  kakao: "KakaoTalk"
};

export const channelRoles: Record<ChannelType, string> = {
  threads: "빠른 반응",
  x: "확산/공유",
  wordpress: "SEO 자산",
  kakao: "신뢰 전환"
};

export const reviewModeLabels: Record<ReviewMode, string> = {
  manual: "운영자 검수",
  semi_auto: "반자동 검수",
  auto: "자동 검수"
};

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  draft: "작성 중",
  open: "모집 중",
  closed: "마감",
  paused: "일시 중지",
  completed: "종료"
};

export const submissionStatusLabels: Record<SubmissionStatus, string> = {
  submitted: "제출됨",
  processing: "검사 중",
  needs_review: "검수 필요",
  auto_approved: "자동 승인",
  auto_rejected: "자동 반려",
  approved: "승인",
  rejected: "반려",
  fulfillment_pending: "처리 대기",
  completed: "체험 완료",
  revoked: "취소"
};

export const experienceTypeLabels: Record<ExperienceType, string> = {
  product: "제품 제공",
  local: "방문 체험"
};

export const industryOptions: Industry[] = [
  "뷰티",
  "푸드",
  "생활",
  "패션",
  "디지털",
  "육아",
  "반려",
  "건강",
  "여행",
  "교육",
  "문화",
  "로컬서비스"
];

export const productCategoryOptions = ["스킨케어", "식품", "생활용품", "패션잡화", "가전/디지털", "도서/교육", "반려용품"] as const;
export const localCategoryOptions = ["맛집", "카페", "뷰티샵", "피트니스", "클래스", "숙박", "전시/공연", "체험공간"] as const;

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  applied: "신청 검토 중",
  selected: "선정",
  rejected: "미선정",
  cancelled: "취소"
};

export const verificationStatusLabels: Record<VerificationStatus, string> = {
  pending: "확인 대기",
  verified: "인증 완료",
  rejected: "인증 반려"
};

export const money = (value: number) => `${value.toLocaleString("ko-KR")}원`;

export const shortDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(new Date(value));
