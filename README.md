# SPREAD MVP

SPREAD는 Threads, X, WordPress, KakaoTalk 피드 기반으로 반응을 퍼뜨리고 전환을 만드는 미션 플랫폼 MVP입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 주요 라우트

- `/login`: 사용자/광고주 탭 진입. admin은 푸터 소형 링크
- `/member`: 참여자 홈
- `/member/campaigns`: 캠페인 목록
- `/member/campaigns/[id]`: 캠페인 상세
- `/member/apply/[campaignId]`: 캠페인 신청 및 기본 개인정보 동의
- `/member/submit/[campaignId]`: 제출 및 자동 검수 미리보기
- `/member/submissions`: 내 제출 내역
- `/member/profile`: 마이페이지
- `/admin`: 운영 대시보드
- `/admin/analytics`: 자체 분석 어드민
- `/admin/campaigns`: 캠페인 관리
- `/admin/campaigns/new`: 캠페인 생성
- `/admin/campaigns/[id]/edit`: 캠페인 수정
- `/admin/campaigns/[id]/applications`: 전체 신청자 선정 및 CSV 다운로드
- `/admin/submissions`: 제출물 검수/체험 완료 처리
- `/brand`: 광고주 대시보드
- `/brand/campaigns`: 광고주 캠페인 목록
- `/brand/campaigns/[id]/applications`: 광고주 신청자 선정 및 CSV 다운로드

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

- `types/spread.ts`: User, Campaign, CampaignApplication, FulfillmentInfo, Submission 등 핵심 타입
- `lib/mock-data.ts`: 사용자, 브랜드, 제품형/지역형 캠페인 6개, 신청/선정/처리정보 샘플
- `services/submission-auto-check.ts`: URL 정규화, 채널 검사, 중복 검사, 키워드/금지 표현/길이 검사, 상태 분기
- `services/spread-service.ts`: mock mode 서비스 함수. Supabase real mode로 교체하기 쉬운 경계
- `services/analytics-service.ts`: 익명 방문/세션/이벤트 저장 및 분석 집계
- `app/api/analytics/events/route.ts`: 내부 이벤트 수집 API

## 제품/지역 캠페인 흐름

- 캠페인은 `제품 배송형` 또는 `지역 방문형` 중 하나입니다.
- 제품형 카드에는 수령 방식, 지역형 카드에는 방문 지역을 표시합니다.
- 제품형은 선정 후 수령인, 휴대폰, 우편번호, 주소, 상세주소, 배송 메모를 받습니다.
- 지역형은 선정 후 방문자명, 휴대폰, 방문 희망일/시간, 동반 인원, 요청사항을 받습니다.
- 신청 단계와 선정 후 처리정보 제출 단계에서 개인정보 동의를 별도로 받습니다.
- 개인정보 동의에는 수집 목적, 수집 항목, 제공받는 자, 보유기간, 동의 거부권 및 불이익을 표시합니다.
- 기본 보유기간은 캠페인 종료 후 30일입니다.

## CSV

- 선정 전 CSV: 닉네임, 채널, 핸들, 채널 링크/캡처, 팔로워/친구수, 승인률, 신청 메모, 신청일, 상태.
- 처리정보 CSV: 개인정보 동의 완료자의 배송 주소 또는 방문 연락처와 보관 만료일.

## 광고주 운영

- 광고주는 `draft`, `open`, `paused` 상태 캠페인을 동시에 최대 2개까지 운영할 수 있습니다.
- 기존 캠페인은 새 캠페인 생성 화면에서 불러와 기본 정보, 체험 정보, 채널, 가이드라인을 복사할 수 있습니다.
- 제출 폼은 채널별 셀프검수 체크리스트를 먼저 통과해야 제출할 수 있습니다.

## 내부 분석

- `/admin/analytics`에서 가입, 방문, 활성, 신청, 선정, 제출, 상위 캠페인/페이지, 코호트 리텐션을 확인할 수 있습니다.
- Google Analytics 없이 `analytics_visitors`, `analytics_sessions`, `analytics_events` 테이블로 직접 수집합니다.
- 익명 방문자는 쿠키 기반 `visitor_id`, `session_id`로 추적하고 로그인 시 `user_id`와 연결합니다.
- 원본 이벤트 보관 기준은 12개월입니다.

## Supabase 준비

`.env.example`을 `.env.local`로 복사한 뒤 실제 프로젝트 값을 채웁니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 둘 다 있을 때만 Supabase live mode로 동작합니다. 하나라도 비어 있으면 mock mode로 안전하게 렌더링합니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 비밀키입니다. 노출되면 즉시 Supabase에서 회전/재발급하고 Netlify 환경변수도 교체해야 합니다.

- `supabase/client.ts`: 클라이언트 컴포넌트용 browser client
- `supabase/server.ts`: 서버 컴포넌트/서버 액션용 server client
- `supabase/database.types.ts`: Supabase 타입 placeholder
- `supabase/schema.sql`: MVP 테이블 생성 초안
- `supabase/analytics-schema.sql`: 내부 분석 테이블/인덱스/RLS 추가 SQL
- Storage bucket: 캠페인 대표 이미지는 `campaign-covers`, 채널 인증은 `channel-verifications`, 개인정보성 처리 파일은 별도 private bucket 사용을 권장합니다.
- `services/campaign-assets.ts`: 대표 이미지 업로드 후 public URL을 반환하는 연결 초안

## 확장 포인트

- Supabase Auth 적용: `/login` 폼 submit에서 email OTP 또는 OAuth 연결
- Storage 적용: KakaoTalk 인증 스크린샷 업로드를 Supabase Storage bucket으로 연결
- 외부 API 연동: WordPress는 URL fetch/본문 추출, X/Threads는 반자동 검수 이벤트로 확장
- 운영 액션 영속화: 신청자 선정, 처리정보 제출, 제출물 승인/반려/체험 완료를 서버 액션으로 전환
- 개인정보 파기 작업: retentionUntil 기준 삭제 작업을 예약 작업으로 연결
