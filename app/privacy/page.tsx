import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Section } from "@/components/ui/card";

export const metadata = {
  title: "개인정보처리방침 | SPREAD",
};

export default function PrivacyPage() {
  return (
    <AppShell role="public">
      <Section className="max-w-3xl py-12">
        <h1 className="text-3xl font-black">개인정보처리방침</h1>
        <p className="mt-2 text-sm text-spread-ink/60">시행일: 2026년 4월 23일</p>

        <div className="mt-10 grid gap-10 text-sm leading-7 text-spread-ink/80">
          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">1. 개인정보 처리자 정보</h2>
            <ul className="grid gap-1 pl-4">
              <li>상호명: 이상한회사</li>
              <li>대표자: 이상빈</li>
              <li>주소: 상동로 87 가나베스트타운 803-102호</li>
              <li>개인정보보호책임자: 이상빈 (dypapa0309@gmail.com)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">2. 수집하는 개인정보 항목 및 수집 방법</h2>
            <p className="mb-3">이상한회사는 SPREAD 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.</p>
            <div className="grid gap-4 pl-4">
              <div>
                <p className="font-semibold text-spread-ink">회원가입 시</p>
                <p>이메일 주소, 닉네임, 이름, 비밀번호</p>
              </div>
              <div>
                <p className="font-semibold text-spread-ink">채널 등록 시</p>
                <p>SNS 채널명, 채널 URL, 핸들(아이디), 팔로워 수, 인증 스크린샷</p>
              </div>
              <div>
                <p className="font-semibold text-spread-ink">제품 체험 캠페인 참여 시 (배송 정보)</p>
                <p>수령인 이름, 휴대폰 번호, 우편번호, 주소, 배송 메모</p>
              </div>
              <div>
                <p className="font-semibold text-spread-ink">로컬 체험 캠페인 참여 시 (방문 정보)</p>
                <p>방문자 이름, 휴대폰 번호, 방문 희망 일시, 동반 인원 수</p>
              </div>
              <div>
                <p className="font-semibold text-spread-ink">서비스 이용 중 자동 수집</p>
                <p>브라우저 정보, 접속 경로, 리퍼러, 쿠키 기반 방문 식별자, 서비스 이용 기록</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">3. 개인정보 수집 및 이용 목적</h2>
            <ul className="grid gap-2 pl-4">
              <li>① 회원 가입 및 관리: 본인 확인, 중복 가입 방지, 계정 관리</li>
              <li>② 캠페인 운영: 체험단 신청·선정·제출 관리, 혜택 제공</li>
              <li>③ 제품/서비스 배송 및 방문 예약 처리</li>
              <li>④ 서비스 품질 개선 및 내부 이용 분석 (방문, 신청, 제출 흐름 분석 포함)</li>
              <li>⑤ 서비스 관련 고지사항 전달 및 민원 처리</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">4. 개인정보 보유 및 이용 기간</h2>
            <p className="mb-3">회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성되면 해당 정보를 즉시 파기합니다. 단, 아래의 경우 명시된 기간 동안 보존합니다.</p>
            <ul className="grid gap-2 pl-4">
              <li>① 회원 정보: 회원 탈퇴 시까지</li>
              <li>② 캠페인 참여 정보 (신청, 제출 내역): 캠페인 종료 후 1년</li>
              <li>③ 배송·방문 이행 정보(개인정보): 이행 완료 후 6개월</li>
              <li>④ 내부 서비스 분석 이벤트 및 세션 정보: 수집일로부터 12개월</li>
              <li>⑤ 관련 법령에 따른 보존 의무가 있는 경우 해당 기간
                <ul className="mt-2 grid gap-1 pl-4">
                  <li>- 전자상거래 관련: 계약·청약 철회 기록 5년, 대금 결제 기록 5년</li>
                  <li>- 소비자 불만·분쟁 처리 기록: 3년</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">5. 개인정보의 제3자 제공</h2>
            <p className="mb-3">회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우는 예외로 합니다.</p>
            <ul className="grid gap-2 pl-4">
              <li>① 이용자가 사전에 동의한 경우</li>
              <li>② 법령의 규정에 의거하거나 수사 목적으로 법령에서 정한 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              <li>③ 캠페인 이행을 위해 광고주에게 배송/방문 정보를 제공하는 경우 (별도 동의 취득)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">6. 개인정보 처리 위탁</h2>
            <p>회사는 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁하고 있습니다.</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-spread-ink/20 text-left text-spread-ink">
                    <th className="py-2 pr-4 font-semibold">수탁업체</th>
                    <th className="py-2 font-semibold">위탁 업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-spread-ink/10">
                    <td className="py-2 pr-4">Supabase Inc.</td>
                    <td className="py-2">데이터베이스 및 인증 서비스 운영</td>
                  </tr>
                  <tr className="border-b border-spread-ink/10">
                    <td className="py-2 pr-4">Vercel Inc.</td>
                    <td className="py-2">서비스 호스팅 및 배포</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">7. 이용자의 권리 및 행사 방법</h2>
            <ul className="grid gap-2 pl-4">
              <li>① 이용자는 언제든지 본인의 개인정보 열람, 수정, 삭제, 처리 정지를 요청할 수 있습니다.</li>
              <li>② 위 요청은 아래 개인정보보호책임자 이메일로 연락하시면 지체 없이 처리합니다.</li>
              <li>③ 만 14세 미만 아동의 개인정보는 수집하지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">8. 쿠키(Cookie) 운영</h2>
            <ul className="grid gap-2 pl-4">
              <li>① 회사는 이용자의 편의를 위해 쿠키를 사용합니다.</li>
              <li>② 쿠키와 유사 식별자는 세션 유지, 익명 방문 식별, 서비스 이용 분석 목적으로 사용됩니다.</li>
              <li>③ 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">9. 개인정보의 안전성 확보 조치</h2>
            <ul className="grid gap-2 pl-4">
              <li>① 비밀번호 암호화 저장</li>
              <li>② 해킹 등 외부 침입 방지를 위한 보안 솔루션 적용</li>
              <li>③ 개인정보 처리 시스템 접근 권한 최소화</li>
              <li>④ 개인정보 처리 직원 대상 정기 보안 교육</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">10. 개인정보보호책임자</h2>
            <ul className="grid gap-1 pl-4">
              <li>성명: 이상빈</li>
              <li>이메일: <a href="mailto:dypapa0309@gmail.com" className="underline">dypapa0309@gmail.com</a></li>
            </ul>
            <p className="mt-3">개인정보 침해 관련 신고 및 상담은 아래 기관에 문의하실 수 있습니다.</p>
            <ul className="mt-2 grid gap-1 pl-4">
              <li>개인정보 침해신고센터: privacy.kisa.or.kr / (국번없이) 118</li>
              <li>대검찰청 사이버수사과: www.spo.go.kr / (국번없이) 1301</li>
              <li>경찰청 사이버안전국: ecrm.cyber.go.kr / (국번없이) 182</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">11. 개인정보처리방침 변경</h2>
            <p>본 방침은 법령 및 정책 변경에 따라 수정될 수 있으며, 변경 시 최소 7일 전에 서비스 내 공지합니다.</p>
          </section>
        </div>

        <div className="mt-12 border-t border-spread-ink/10 pt-6 text-xs text-spread-ink/50">
          <Link href="/" className="hover:text-spread-ink">← 홈으로</Link>
        </div>
      </Section>
    </AppShell>
  );
}
