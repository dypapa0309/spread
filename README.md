# SPREAD MVP

SPREAD는 Threads, X, WordPress, KakaoTalk 피드 기반으로 반응을 퍼뜨리고 전환을 만드는 미션 플랫폼 MVP입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 주요 라우트

- `/login`: 더미 member/admin 진입
- `/member`: 참여자 홈
- `/member/campaigns`: 캠페인 목록
- `/member/campaigns/[id]`: 캠페인 상세
- `/member/submit/[campaignId]`: 제출 및 자동 검수 미리보기
- `/member/submissions`: 내 제출 내역
- `/member/profile`: 마이페이지
- `/admin`: 운영 대시보드
- `/admin/campaigns`: 캠페인 관리
- `/admin/campaigns/new`: 캠페인 생성
- `/admin/campaigns/[id]/edit`: 캠페인 수정
- `/admin/submissions`: 제출물 검수/보상 처리

## 폴더 구조

```text
app/
components/
  admin/
  member/
  ui/
lib/
services/
supabase/
types/
```

## 데이터와 자동화

- `types/spread.ts`: User, Campaign, Submission, Reward 등 핵심 타입
- `lib/mock-data.ts`: 사용자 3명, 브랜드 3개, 캠페인 6개, 제출물 10개 이상
- `services/submission-auto-check.ts`: URL 정규화, 채널 검사, 중복 검사, 키워드/금지 표현/길이 검사, 상태 분기
- `services/spread-service.ts`: mock mode 서비스 함수. Supabase real mode로 교체하기 쉬운 경계

## Supabase 준비

`.env.example`을 `.env.local`로 복사한 뒤 실제 프로젝트 값을 채웁니다.

```bash
NEXT_PUBLIC_APP_MODE=mock
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- `supabase/client.ts`: 클라이언트 컴포넌트용 browser client
- `supabase/server.ts`: 서버 컴포넌트/서버 액션용 server client
- `supabase/database.types.ts`: Supabase 타입 placeholder
- `supabase/schema.sql`: MVP 테이블 생성 초안
- Storage bucket: 캠페인 대표 이미지는 `campaign-covers`, KakaoTalk 인증 이미지는 `submission-screenshots` 버킷을 권장합니다.
- `services/campaign-assets.ts`: 대표 이미지 업로드 후 public URL을 반환하는 연결 초안

## 확장 포인트

- Supabase Auth 적용: `/login` 폼 submit에서 email OTP 또는 OAuth 연결
- Storage 적용: KakaoTalk 인증 스크린샷 업로드를 Supabase Storage bucket으로 연결
- 외부 API 연동: WordPress는 URL fetch/본문 추출, X/Threads는 반자동 검수 이벤트로 확장
- 운영 액션 영속화: `/admin/submissions`의 승인/반려/보상 확정을 서버 액션으로 전환
- 보상 지급: Reward 상태를 payout provider와 연결
