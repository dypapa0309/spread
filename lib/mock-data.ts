import type {
  Brand,
  Campaign,
  CampaignApplication,
  CampaignChannel,
  CampaignFormat,
  CampaignGuideline,
  CampaignView,
  FulfillmentInfo,
  Submission,
  SubmissionMetrics,
  SubmissionView,
  User,
  UserChannel,
  UserPenalty
} from "@/types/spread";

const now = "2026-04-23T02:00:00.000Z";

export const users: User[] = [
  {
    id: "user-member-1",
    role: "member",
    nickname: "spread_sia",
    name: "이시아",
    email: "sia@example.com",
    bio: "짧은 문장으로 제품 반응을 잘 만듭니다.",
    level: 4,
    score: 842,
    completedMissions: 18,
    status: "active",
    createdAt: "2026-01-02T09:00:00.000Z",
    updatedAt: now
  },
  {
    id: "user-member-2",
    role: "member",
    nickname: "wordpresso",
    name: "박도윤",
    email: "doyun@example.com",
    bio: "WordPress 비교 글과 검색형 콘텐츠를 씁니다.",
    level: 5,
    score: 1260,
    completedMissions: 31,
    status: "active",
    createdAt: "2026-01-12T09:00:00.000Z",
    updatedAt: now
  },
  {
    id: "user-admin-1",
    role: "admin",
    nickname: "ops_hae",
    name: "정해린",
    email: "admin@spread.local",
    bio: "SPREAD 운영자",
    level: 1,
    score: 0,
    completedMissions: 0,
    status: "active",
    createdAt: "2025-12-20T09:00:00.000Z",
    updatedAt: now
  },
  {
    id: "user-member-3",
    role: "member",
    nickname: "daily_signal",
    name: "김하루",
    email: "haru@example.com",
    bio: "X에서 의견형 포스트를 빠르게 테스트합니다.",
    level: 3,
    score: 510,
    completedMissions: 9,
    status: "active",
    createdAt: "2026-02-02T09:00:00.000Z",
    updatedAt: now
  },
  {
    id: "user-member-4",
    role: "member",
    nickname: "kakao_mina",
    name: "오민아",
    email: "mina@example.com",
    bio: "신뢰 기반 추천 콘텐츠에 강합니다.",
    level: 2,
    score: 360,
    completedMissions: 6,
    status: "active",
    createdAt: "2026-02-10T09:00:00.000Z",
    updatedAt: now
  },
  {
    id: "user-member-5",
    role: "member",
    nickname: "seo_jinlab",
    name: "한서진",
    email: "seojin@example.com",
    bio: "검색형 비교 리뷰를 꾸준히 씁니다.",
    level: 4,
    score: 930,
    completedMissions: 22,
    status: "active",
    createdAt: "2026-02-18T09:00:00.000Z",
    updatedAt: now
  }
];

export const userChannels: UserChannel[] = [
  { id: "uc-1", userId: "user-member-1", channelType: "threads", channelName: "시아 Threads", channelUrl: "https://www.threads.net/@spread_sia", handle: "@spread_sia", followerCount: 3800, verificationStatus: "verified", verifiedAt: now, isVerified: true, isActive: true, createdAt: now },
  { id: "uc-2", userId: "user-member-1", channelType: "x", channelName: "시아 X", channelUrl: "https://x.com/spread_sia", handle: "@spread_sia", followerCount: 6200, verificationStatus: "verified", verifiedAt: now, isVerified: true, isActive: true, createdAt: now },
  { id: "uc-3", userId: "user-member-1", channelType: "kakao", channelName: "시아 피드", handle: "spread_sia", followerCount: 0, friendCount: 900, verificationScreenshotUrl: "/mock/kakao-profile-sia.png", verificationStatus: "pending", isVerified: false, isActive: true, createdAt: now },
  { id: "uc-4", userId: "user-member-2", channelType: "wordpress", channelName: "도윤 리뷰랩", channelUrl: "https://reviewlab.example.com", handle: "reviewlab", followerCount: 12000, verificationStatus: "verified", verifiedAt: now, isVerified: true, isActive: true, createdAt: now },
  { id: "uc-5", userId: "user-member-3", channelType: "x", channelName: "하루 X", channelUrl: "https://x.com/daily_signal", handle: "@daily_signal", followerCount: 2400, verificationStatus: "verified", verifiedAt: now, isVerified: true, isActive: true, createdAt: now },
  { id: "uc-6", userId: "user-member-4", channelType: "kakao", channelName: "민아 피드", handle: "kakao_mina", followerCount: 0, friendCount: 1280, verificationScreenshotUrl: "/mock/kakao-profile-mina.png", verificationStatus: "verified", verifiedAt: now, isVerified: true, isActive: true, createdAt: now },
  { id: "uc-7", userId: "user-member-5", channelType: "wordpress", channelName: "서진랩", channelUrl: "https://seojinlab.example.com", handle: "seojinlab", followerCount: 8300, verificationStatus: "verified", verifiedAt: now, isVerified: true, isActive: true, createdAt: now }
];

export const brands: Brand[] = [
  { id: "brand-1", name: "Nova Desk", description: "작은 팀을 위한 업무 집중 도구", websiteUrl: "https://nova.example.com", contactName: "강민재", contactEmail: "brand@nova.example.com", plan: "basic", planStartedAt: now, status: "active", createdAt: now, updatedAt: now },
  { id: "brand-2", name: "Mellow Bean", description: "로컬 로스터리 기반 커피 구독", websiteUrl: "https://mellow.example.com", contactName: "서윤아", contactEmail: "hello@mellow.example.com", plan: "standard", planStartedAt: now, status: "active", createdAt: now, updatedAt: now },
  { id: "brand-3", name: "FitLoop", description: "습관형 운동 기록 앱", websiteUrl: "https://fitloop.example.com", contactName: "최라온", contactEmail: "growth@fitloop.example.com", plan: "pro", planStartedAt: now, status: "active", createdAt: now, updatedAt: now }
];

export const campaigns: Campaign[] = [
  { id: "camp-1", brandId: "brand-1", title: "Nova Desk 제품 배송 미션", slug: "threads-one-line-nova", summary: "업무 기록 키트를 받아 Threads에 첫 반응을 남겨요.", description: "Nova Desk 스타터 키트를 배송받고 협업 기록 기능을 써본 뒤 빠르게 반응이 생길 만한 한 문장을 작성합니다.", coverImageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop", productName: "Nova Desk", experienceType: "product", industry: "디지털", category: "가전/디지털", offerTitle: "Nova Desk 스타터 키트", offerDescription: "협업 기록 앱 30일 이용권과 데스크 노트 키트를 제공합니다.", offerValueLabel: "제품 배송", privacyRetentionDays: 30, startAt: "2026-04-20T00:00:00.000Z", endAt: "2026-05-02T14:59:00.000Z", applyEndAt: "2026-04-27T14:59:00.000Z", submissionDueAt: "2026-05-02T14:59:00.000Z", recruitLimit: 80, status: "open", reviewMode: "semi_auto", visibility: "public", createdBy: "user-admin-1", createdAt: now, updatedAt: now },
  { id: "camp-2", brandId: "brand-2", title: "Mellow Bean 커피 배송 미션", slug: "x-debate-mellow", summary: "커피 샘플팩을 받고 X에서 루틴 의견을 던져요.", description: "Mellow Bean 샘플팩을 배송받아 첫 배송 경험을 바탕으로 공유와 답글이 생기는 의견형 포스트를 작성합니다.", coverImageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop", productName: "Mellow Bean Trial", experienceType: "product", industry: "푸드", category: "식품", offerTitle: "Mellow Bean 샘플팩", offerDescription: "싱글오리진 드립백 5종 샘플 구성을 제공합니다.", offerValueLabel: "제품 배송", privacyRetentionDays: 30, startAt: "2026-04-18T00:00:00.000Z", endAt: "2026-05-05T14:59:00.000Z", applyEndAt: "2026-04-29T14:59:00.000Z", submissionDueAt: "2026-05-05T14:59:00.000Z", recruitLimit: 60, status: "open", reviewMode: "semi_auto", visibility: "public", createdBy: "user-admin-1", createdAt: now, updatedAt: now },
  { id: "camp-3", brandId: "brand-3", title: "FitLoop Pro 제품 체험", slug: "wordpress-comparison-fitloop", summary: "Pro 이용권을 받아 WordPress 비교 리뷰를 발행합니다.", description: "FitLoop Pro 60일 이용권을 받고 기존 운동 기록 앱과 비교해 장단점이 분명한 WordPress 글을 발행합니다.", coverImageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop", productName: "FitLoop Pro", experienceType: "product", industry: "건강", category: "가전/디지털", offerTitle: "FitLoop Pro 60일 이용권", offerDescription: "습관 기록 앱 Pro 플랜 이용권을 제공합니다.", offerValueLabel: "이용권 제공", privacyRetentionDays: 30, startAt: "2026-04-10T00:00:00.000Z", endAt: "2026-05-10T14:59:00.000Z", applyEndAt: "2026-04-30T14:59:00.000Z", submissionDueAt: "2026-05-10T14:59:00.000Z", recruitLimit: 25, status: "open", reviewMode: "auto", visibility: "public", createdBy: "user-admin-1", createdAt: now, updatedAt: now },
  { id: "camp-4", brandId: "brand-2", title: "성수 로스터리 방문 체험", slug: "kakao-recommend-mellow", summary: "성수 매장에서 커피 페어링을 체험하고 KakaoTalk 피드에 추천해요.", description: "Mellow Bean 성수 쇼룸에 방문해 커피 페어링을 체험하고 누구에게 추천하는지 중심으로 KakaoTalk 피드 인증을 제출합니다.", coverImageUrl: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=1200&auto=format&fit=crop", productName: "Mellow Bean Sample", experienceType: "local", industry: "푸드", category: "카페", offerTitle: "성수 로스터리 커피 페어링", offerDescription: "예약 시간에 방문해 시음과 원두 설명을 체험합니다.", offerValueLabel: "방문 체험", regionProvince: "서울", regionDistrict: "성동구", venueAddress: "서울 성동구 연무장길 12", venueName: "Mellow Bean 성수 쇼룸", privacyRetentionDays: 30, startAt: "2026-04-21T00:00:00.000Z", endAt: "2026-05-04T14:59:00.000Z", applyEndAt: "2026-04-28T14:59:00.000Z", submissionDueAt: "2026-05-04T14:59:00.000Z", recruitLimit: 40, status: "open", reviewMode: "manual", visibility: "public", createdBy: "user-admin-1", createdAt: now, updatedAt: now },
  { id: "camp-5", brandId: "brand-1", title: "강남 워크라운지 방문 미션", slug: "threads-question-nova", summary: "업무 기록 워크라운지를 방문하고 질문형 콘텐츠를 발행합니다.", description: "Nova Desk 워크라운지에서 협업 기록 세션을 체험한 뒤 Threads 또는 X에서 업무 기록 방식에 대한 질문형 콘텐츠를 발행합니다.", coverImageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1200&auto=format&fit=crop", productName: "Nova Desk Notes", experienceType: "local", industry: "교육", category: "클래스", offerTitle: "협업 기록 워크라운지 세션", offerDescription: "강남 워크라운지에서 60분 체험 세션을 제공합니다.", offerValueLabel: "방문 체험", regionProvince: "서울", regionDistrict: "강남구", venueAddress: "서울 강남구 테헤란로 24", venueName: "Nova Desk 워크라운지", privacyRetentionDays: 30, startAt: "2026-04-15T00:00:00.000Z", endAt: "2026-04-28T14:59:00.000Z", applyEndAt: "2026-04-24T14:59:00.000Z", submissionDueAt: "2026-04-28T14:59:00.000Z", recruitLimit: 100, status: "open", reviewMode: "semi_auto", visibility: "public", createdBy: "user-admin-1", createdAt: now, updatedAt: now },
  { id: "camp-6", brandId: "brand-3", title: "FitLoop 오프라인 루틴 클래스", slug: "x-story-fitloop", summary: "작은 루틴 클래스에 참여하고 짧은 스토리로 공유해요.", description: "FitLoop의 오프라인 루틴 클래스에 방문한 뒤 X에 짧은 스토리형 포스트를 작성합니다.", coverImageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop", productName: "FitLoop Streak", experienceType: "local", industry: "건강", category: "피트니스", offerTitle: "루틴 만들기 1회 클래스", offerDescription: "운동 기록과 루틴 설계를 함께 해보는 오프라인 클래스를 제공합니다.", offerValueLabel: "방문 체험", regionProvince: "경기", regionDistrict: "성남시 분당구", venueAddress: "경기 성남시 분당구 판교역로 166", venueName: "FitLoop 판교 스튜디오", privacyRetentionDays: 30, startAt: "2026-04-01T00:00:00.000Z", endAt: "2026-04-23T14:59:00.000Z", applyEndAt: "2026-04-12T14:59:00.000Z", submissionDueAt: "2026-04-23T14:59:00.000Z", recruitLimit: 70, status: "closed", reviewMode: "semi_auto", visibility: "public", createdBy: "user-admin-1", createdAt: now, updatedAt: now }
];

export const campaignChannels: CampaignChannel[] = [
  { id: "cc-1", campaignId: "camp-1", channelType: "threads" },
  { id: "cc-2", campaignId: "camp-2", channelType: "x" },
  { id: "cc-3", campaignId: "camp-3", channelType: "wordpress" },
  { id: "cc-4", campaignId: "camp-4", channelType: "kakao" },
  { id: "cc-5", campaignId: "camp-5", channelType: "threads" },
  { id: "cc-6", campaignId: "camp-5", channelType: "x" },
  { id: "cc-7", campaignId: "camp-6", channelType: "x" }
];

export const campaignFormats: CampaignFormat[] = [
  { id: "cf-1", campaignId: "camp-1", formatType: "one_line" },
  { id: "cf-2", campaignId: "camp-2", formatType: "debate" },
  { id: "cf-3", campaignId: "camp-2", formatType: "question" },
  { id: "cf-4", campaignId: "camp-3", formatType: "comparison" },
  { id: "cf-5", campaignId: "camp-4", formatType: "recommendation" },
  { id: "cf-6", campaignId: "camp-5", formatType: "question" },
  { id: "cf-7", campaignId: "camp-6", formatType: "story" }
];

export const campaignApplications: CampaignApplication[] = [
  { id: "app-1", campaignId: "camp-1", userId: "user-member-1", channelType: "threads", message: "제품을 받아 업무 루틴 문장으로 반응을 만들겠습니다.", status: "selected", applicationPrivacyAgreed: true, applicationPrivacyAgreedAt: "2026-04-20T04:00:00.000Z", appliedAt: "2026-04-20T04:00:00.000Z", decidedAt: "2026-04-20T08:00:00.000Z", decidedBy: "user-admin-1", adminNote: "Threads 반응 속도 좋음" },
  { id: "app-2", campaignId: "camp-1", userId: "user-member-2", channelType: "threads", message: "기록형 콘텐츠 관점으로 제품 첫인상을 남기겠습니다.", status: "selected", applicationPrivacyAgreed: true, applicationPrivacyAgreedAt: "2026-04-20T04:30:00.000Z", appliedAt: "2026-04-20T04:30:00.000Z", decidedAt: "2026-04-20T08:00:00.000Z", decidedBy: "user-admin-1" },
  { id: "app-3", campaignId: "camp-1", userId: "user-member-3", channelType: "threads", message: "업무툴 실사용자 관점으로 참여합니다.", status: "applied", applicationPrivacyAgreed: true, applicationPrivacyAgreedAt: "2026-04-21T02:20:00.000Z", appliedAt: "2026-04-21T02:20:00.000Z" },
  { id: "app-4", campaignId: "camp-2", userId: "user-member-1", channelType: "x", message: "배송 받은 커피로 루틴 의견형 포스트를 만들겠습니다.", status: "applied", applicationPrivacyAgreed: true, applicationPrivacyAgreedAt: "2026-04-21T03:00:00.000Z", appliedAt: "2026-04-21T03:00:00.000Z" },
  { id: "app-5", campaignId: "camp-2", userId: "user-member-2", channelType: "x", message: "질문형으로 댓글 반응을 만들겠습니다.", status: "selected", applicationPrivacyAgreed: true, applicationPrivacyAgreedAt: "2026-04-20T10:00:00.000Z", appliedAt: "2026-04-20T10:00:00.000Z", decidedAt: "2026-04-21T01:00:00.000Z", decidedBy: "user-admin-1" },
  { id: "app-6", campaignId: "camp-2", userId: "user-member-3", channelType: "x", message: "X에서 아침 루틴 논쟁형으로 풀어보겠습니다.", status: "selected", applicationPrivacyAgreed: true, applicationPrivacyAgreedAt: "2026-04-20T11:00:00.000Z", appliedAt: "2026-04-20T11:00:00.000Z", decidedAt: "2026-04-21T01:00:00.000Z", decidedBy: "user-admin-1" },
  { id: "app-7", campaignId: "camp-3", userId: "user-member-1", channelType: "wordpress", message: "검색형 리뷰는 약하지만 직접 비교 글로 도전해보겠습니다.", status: "rejected", applicationPrivacyAgreed: true, applicationPrivacyAgreedAt: "2026-04-19T01:00:00.000Z", appliedAt: "2026-04-19T01:00:00.000Z", decidedAt: "2026-04-20T01:00:00.000Z", decidedBy: "user-admin-1", adminNote: "WordPress 채널 미등록" },
  { id: "app-8", campaignId: "camp-3", userId: "user-member-2", channelType: "wordpress", message: "이용권 체험 후 장문 SEO 글로 참여합니다.", status: "selected", applicationPrivacyAgreed: true, applicationPrivacyAgreedAt: "2026-04-14T02:00:00.000Z", appliedAt: "2026-04-14T02:00:00.000Z", decidedAt: "2026-04-15T03:00:00.000Z", decidedBy: "user-admin-1" },
  { id: "app-9", campaignId: "camp-3", userId: "user-member-5", channelType: "wordpress", message: "운동 앱 비교 키워드를 잡아 글을 쓰겠습니다.", status: "applied", applicationPrivacyAgreed: true, applicationPrivacyAgreedAt: "2026-04-21T02:00:00.000Z", appliedAt: "2026-04-21T02:00:00.000Z" },
  { id: "app-10", campaignId: "camp-4", userId: "user-member-4", channelType: "kakao", message: "성수 매장 방문 후 친구 기반 추천형 피드로 전환을 노리겠습니다.", status: "selected", applicationPrivacyAgreed: true, applicationPrivacyAgreedAt: "2026-04-21T05:00:00.000Z", appliedAt: "2026-04-21T05:00:00.000Z", decidedAt: "2026-04-22T01:00:00.000Z", decidedBy: "user-admin-1" },
  { id: "app-11", campaignId: "camp-4", userId: "user-member-1", channelType: "kakao", message: "카카오 친구 대상 추천 문구로 참여하고 싶습니다.", status: "applied", applicationPrivacyAgreed: true, applicationPrivacyAgreedAt: "2026-04-22T03:00:00.000Z", appliedAt: "2026-04-22T03:00:00.000Z" },
  { id: "app-12", campaignId: "camp-5", userId: "user-member-1", channelType: "threads", message: "방문 세션 후 질문형 Threads 포스트로 반응을 모으겠습니다.", status: "selected", applicationPrivacyAgreed: true, applicationPrivacyAgreedAt: "2026-04-16T02:00:00.000Z", appliedAt: "2026-04-16T02:00:00.000Z", decidedAt: "2026-04-16T08:00:00.000Z", decidedBy: "user-admin-1" },
  { id: "app-13", campaignId: "camp-5", userId: "user-member-3", channelType: "x", message: "X 질문형으로 답글을 유도하겠습니다.", status: "rejected", applicationPrivacyAgreed: true, applicationPrivacyAgreedAt: "2026-04-16T04:00:00.000Z", appliedAt: "2026-04-16T04:00:00.000Z", decidedAt: "2026-04-17T01:00:00.000Z", decidedBy: "user-admin-1" },
  { id: "app-14", campaignId: "camp-6", userId: "user-member-2", channelType: "x", message: "루틴 클래스 방문 후 스토리로 작성하겠습니다.", status: "selected", applicationPrivacyAgreed: true, applicationPrivacyAgreedAt: "2026-04-04T04:00:00.000Z", appliedAt: "2026-04-04T04:00:00.000Z", decidedAt: "2026-04-05T01:00:00.000Z", decidedBy: "user-admin-1" }
];

export const fulfillmentInfos: FulfillmentInfo[] = [
  {
    id: "fulfill-1",
    campaignId: "camp-1",
    applicationId: "app-1",
    userId: "user-member-1",
    type: "product",
    productInfo: {
      recipientName: "이시아",
      phone: "010-1234-5678",
      postalCode: "04783",
      address: "서울 성동구 왕십리로 100",
      addressDetail: "1203호",
      deliveryMemo: "문 앞에 놓아주세요."
    },
    privacyAgreed: true,
    privacyAgreedAt: "2026-04-20T09:00:00.000Z",
    retentionUntil: "2026-06-01T14:59:00.000Z",
    createdAt: "2026-04-20T09:00:00.000Z"
  },
  {
    id: "fulfill-2",
    campaignId: "camp-2",
    applicationId: "app-6",
    userId: "user-member-3",
    type: "product",
    productInfo: {
      recipientName: "김하루",
      phone: "010-5555-2040",
      postalCode: "06120",
      address: "서울 강남구 강남대로 340",
      addressDetail: "8층",
      deliveryMemo: "평일 오후 수령 가능"
    },
    privacyAgreed: true,
    privacyAgreedAt: "2026-04-21T02:00:00.000Z",
    retentionUntil: "2026-06-04T14:59:00.000Z",
    createdAt: "2026-04-21T02:00:00.000Z"
  },
  {
    id: "fulfill-3",
    campaignId: "camp-4",
    applicationId: "app-10",
    userId: "user-member-4",
    type: "local",
    localInfo: {
      visitorName: "오민아",
      phone: "010-7777-1180",
      preferredVisitAt: "2026-04-26T05:00:00.000Z",
      companionCount: 1,
      requestNote: "오후 2시 방문 희망"
    },
    privacyAgreed: true,
    privacyAgreedAt: "2026-04-22T02:00:00.000Z",
    retentionUntil: "2026-06-03T14:59:00.000Z",
    createdAt: "2026-04-22T02:00:00.000Z"
  }
];

export const userPenalties: UserPenalty[] = [
  {
    id: "penalty-1",
    userId: "user-member-2",
    submissionId: "sub-6",
    campaignId: "camp-6",
    reason: "제출 기한 초과",
    daysLate: 2,
    suspensionDays: 6,
    startsAt: "2026-04-23T00:00:00.000Z",
    endsAt: "2026-04-29T00:00:00.000Z",
    createdAt: "2026-04-23T00:00:00.000Z"
  }
];

export const guidelines: CampaignGuideline[] = campaigns.map((campaign) => ({
  id: `guide-${campaign.id}`,
  campaignId: campaign.id,
  keyMessage:
    campaign.id === "camp-3"
      ? "FitLoop는 기록 부담을 줄이고 루틴 유지에 집중한다."
      : `${campaign.productName}은 작은 반응을 빠르게 만들 수 있다.`,
  requiredPoints: ["실제 사용 상황 1개", "추천 대상", "개인 의견"],
  prohibitedExpressions: ["무조건 최고", "100% 보장", "광고 아님"],
  requiredHashtags: campaign.brandId === "brand-2" ? ["#MellowBean", "#커피구독"] : ["#SPREAD", "#미션"],
  requiredLinks: campaign.id === "camp-4" ? [] : [brands.find((brand) => brand.id === campaign.brandId)?.websiteUrl ?? ""],
  contentRetentionMonths: 6,
  minTextLength: campaign.id === "camp-1" ? 30 : campaign.id === "camp-3" ? 700 : 80,
  requiredKeywordCount: campaign.id === "camp-3" ? 4 : 2,
  allowPrivateAccount: campaign.id === "camp-4",
  autoApprovalEnabled: campaign.reviewMode !== "manual",
  autoRejectionEnabled: true,
  extraNote: campaign.id === "camp-4" ? "KakaoTalk 피드는 스크린샷 인증이 필요합니다." : "게시물은 6개월 유지 조건을 확인한 뒤 체험 완료 처리됩니다."
}));

const result = (score: number, hasFail = false) => ({
  isValidUrl: !hasFail,
  isAllowedChannel: true,
  isDuplicate: false,
  isPublicLikely: !hasFail,
  hasRequiredKeywords: score > 62,
  hasProhibitedExpression: hasFail,
  meetsMinLength: score > 55,
  needsScreenshot: false,
  score,
  issues: hasFail
    ? [{ code: "prohibited", label: "금지 표현 포함", severity: "fail" as const }]
    : [{ code: "keyword", label: "필수 키워드 확인", severity: score > 75 ? ("pass" as const) : ("warn" as const) }]
});

export const submissions: Submission[] = [
  { id: "sub-1", campaignId: "camp-1", userId: "user-member-1", channelType: "threads", formatType: "one_line", postUrl: "https://www.threads.net/@spread_sia/post/1", postText: "팀 기록이 흩어질 때 Nova Desk 하나로 반응을 먼저 모아보는 중. #SPREAD #미션", postedAt: "2026-04-22T09:10:00.000Z", submittedAt: "2026-04-22T09:18:00.000Z", status: "auto_approved", extractedText: "팀 기록이 흩어질 때 Nova Desk 하나로 반응을 먼저 모아보는 중.", autoCheckScore: 86, autoCheckResult: result(86) },
  { id: "sub-2", campaignId: "camp-2", userId: "user-member-1", channelType: "x", formatType: "debate", postUrl: "https://x.com/spread_sia/status/2", postText: "커피 구독은 취향보다 아침 결정을 줄이는 서비스에 가깝지 않을까. #MellowBean #커피구독", postedAt: "2026-04-22T11:00:00.000Z", submittedAt: "2026-04-22T11:04:00.000Z", status: "needs_review", autoCheckScore: 68, autoCheckResult: result(68) },
  { id: "sub-3", campaignId: "camp-3", userId: "user-member-2", channelType: "wordpress", formatType: "comparison", postUrl: "https://reviewlab.example.com/fitloop-comparison", postText: "FitLoop 비교 리뷰 본문입니다. 운동 기록, 루틴, 유지, 앱 비교 키워드를 포함합니다.", postedAt: "2026-04-21T12:00:00.000Z", submittedAt: "2026-04-21T12:08:00.000Z", status: "fulfillment_pending", autoCheckScore: 92, autoCheckResult: result(92) },
  { id: "sub-4", campaignId: "camp-4", userId: "user-member-1", channelType: "kakao", formatType: "recommendation", postText: "부모님께 선물하기 좋은 커피 구독으로 Mellow Bean을 추천.", screenshotUrl: "/mock/kakao-proof.png", postedAt: "2026-04-21T08:30:00.000Z", submittedAt: "2026-04-21T08:36:00.000Z", status: "approved", reviewNote: "스크린샷 확인 완료", autoCheckScore: 74, autoCheckResult: result(74) },
  { id: "sub-5", campaignId: "camp-5", userId: "user-member-1", channelType: "threads", formatType: "question", postUrl: "https://www.threads.net/@spread_sia/post/5", postText: "팀 노트를 공개 피드로 남기면 참여율이 올라갈까? Nova Desk로 실험 중. #SPREAD #미션", postedAt: "2026-04-20T10:00:00.000Z", submittedAt: "2026-04-20T10:03:00.000Z", status: "completed", autoCheckScore: 88, autoCheckResult: result(88) },
  { id: "sub-6", campaignId: "camp-6", userId: "user-member-2", channelType: "x", formatType: "story", postUrl: "https://x.com/wordpresso/status/6", postText: "FitLoop streak로 운동 기록을 이어간 이야기.", postedAt: "2026-04-19T10:00:00.000Z", submittedAt: "2026-04-19T10:05:00.000Z", status: "auto_rejected", reviewNote: "최소 길이 미달", autoCheckScore: 42, autoCheckResult: result(42) },
  { id: "sub-7", campaignId: "camp-1", userId: "user-member-2", channelType: "threads", formatType: "one_line", postUrl: "https://www.threads.net/@wordpresso/post/7", postText: "Nova Desk는 반응을 모으는 업무 메모에 가깝다. #SPREAD #미션", postedAt: "2026-04-22T13:00:00.000Z", submittedAt: "2026-04-22T13:05:00.000Z", status: "submitted", autoCheckScore: 80, autoCheckResult: result(80) },
  { id: "sub-8", campaignId: "camp-2", userId: "user-member-2", channelType: "x", formatType: "question", postUrl: "https://x.com/wordpresso/status/8", postText: "매일 아침 커피를 고르는 시간이 줄면 루틴이 더 가벼워질까? #MellowBean #커피구독", postedAt: "2026-04-22T14:00:00.000Z", submittedAt: "2026-04-22T14:05:00.000Z", status: "needs_review", autoCheckScore: 71, autoCheckResult: result(71) },
  { id: "sub-9", campaignId: "camp-3", userId: "user-member-2", channelType: "wordpress", formatType: "comparison", postUrl: "https://reviewlab.example.com/fitloop-vs-apps", postText: "운동 기록 앱 비교 리뷰. FitLoop, 루틴, streak, 운동 기록 키워드를 포함한 장문 글.", postedAt: "2026-04-18T09:00:00.000Z", submittedAt: "2026-04-18T09:06:00.000Z", status: "completed", autoCheckScore: 95, autoCheckResult: result(95) },
  { id: "sub-10", campaignId: "camp-4", userId: "user-member-1", channelType: "kakao", formatType: "recommendation", postText: "Mellow Bean은 무조건 최고, 100% 만족 보장.", screenshotUrl: "/mock/kakao-proof-2.png", postedAt: "2026-04-22T15:00:00.000Z", submittedAt: "2026-04-22T15:03:00.000Z", status: "rejected", reviewNote: "금지 표현 포함", autoCheckScore: 25, autoCheckResult: result(25, true) }
];

export const metrics: SubmissionMetrics[] = submissions.map((submission, index) => ({
  id: `metric-${submission.id}`,
  submissionId: submission.id,
  likesCount: 20 + index * 7,
  commentsCount: 3 + index,
  sharesCount: 2 + index,
  clicksCount: 8 + index * 3,
  savesCount: 1 + index,
  viewsCount: 450 + index * 130,
  engagementScore: 18 + index * 4,
  conversionCount: index % 3,
  capturedAt: now
}));

export function getCampaignViews(): CampaignView[] {
  return campaigns.map((campaign) => ({
    ...campaign,
    brand: brands.find((brand) => brand.id === campaign.brandId)!,
    channels: campaignChannels.filter((item) => item.campaignId === campaign.id).map((item) => item.channelType),
    formats: campaignFormats.filter((item) => item.campaignId === campaign.id).map((item) => item.formatType),
    guideline: guidelines.find((item) => item.campaignId === campaign.id)!,
    submissionsCount: submissions.filter((item) => item.campaignId === campaign.id).length,
    applicationsCount: campaignApplications.filter((item) => item.campaignId === campaign.id).length,
    selectedCount: campaignApplications.filter((item) => item.campaignId === campaign.id && item.status === "selected").length,
    myApplicationStatus: campaignApplications.find(
      (item) => item.campaignId === campaign.id && item.userId === currentMember.id
    )?.status
  }));
}

export function getSubmissionViews(): SubmissionView[] {
  return submissions.map((submission) => {
    const campaign = campaigns.find((item) => item.id === submission.campaignId)!;
    return {
      ...submission,
      campaign,
      brand: brands.find((brand) => brand.id === campaign.brandId)!,
      user: users.find((user) => user.id === submission.userId)!,
      metrics: metrics.find((metric) => metric.submissionId === submission.id),
      penalty: userPenalties.find((penalty) => penalty.submissionId === submission.id)
    };
  });
}

export const currentMember = users[0];
export const currentAdmin = users[2];
