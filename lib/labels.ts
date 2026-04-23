import type { ApplicationStatus, ChannelType, FormatType, ReviewMode, SubmissionStatus, VerificationStatus } from "@/types/spread";

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

export const formatLabels: Record<FormatType, string> = {
  one_line: "한줄 반응",
  story: "스토리",
  comparison: "비교",
  question: "질문",
  recommendation: "추천",
  debate: "의견/토론"
};

export const formatTips: Record<FormatType, { example: string; guide: string }> = {
  one_line: {
    example: "요즘 매일 쓰는 툴 하나만 고르면 SPREAD Notes.",
    guide: "한 문장으로 선명하게 반응을 만들어요."
  },
  story: {
    example: "처음에는 가볍게 시작했는데, 하루 기록 루틴이 꽤 오래 남았다.",
    guide: "사용 전후의 상황을 짧은 흐름으로 보여주세요."
  },
  comparison: {
    example: "기존 노트앱보다 공유 후 반응 확인이 훨씬 빠른 편.",
    guide: "대체재와의 차이를 구체적으로 짚어주세요."
  },
  question: {
    example: "팀 기록을 공개 피드로 남기면 참여율이 더 올라갈까?",
    guide: "대화를 부르는 질문으로 댓글을 유도하세요."
  },
  recommendation: {
    example: "작은 팀이 출시 반응을 보고 싶다면 먼저 써볼 만해요.",
    guide: "누구에게 맞는지 명확하게 추천해주세요."
  },
  debate: {
    example: "리뷰보다 중요한 건 첫 반응을 얼마나 빨리 퍼뜨리느냐 아닐까.",
    guide: "찬반이 생길 수 있는 관점을 담아 확산을 노립니다."
  }
};

export const reviewModeLabels: Record<ReviewMode, string> = {
  manual: "운영자 검수",
  semi_auto: "반자동 검수",
  auto: "자동 검수"
};

export const submissionStatusLabels: Record<SubmissionStatus, string> = {
  submitted: "제출됨",
  processing: "검사 중",
  needs_review: "검수 필요",
  auto_approved: "자동 승인",
  auto_rejected: "자동 반려",
  approved: "승인",
  rejected: "반려",
  reward_pending: "보상 대기",
  paid: "지급 완료",
  revoked: "취소"
};

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
