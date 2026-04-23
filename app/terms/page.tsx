import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Section } from "@/components/ui/card";

export const metadata = {
  title: "이용약관 | SPREAD",
};

export default function TermsPage() {
  return (
    <AppShell role="public">
      <Section className="max-w-3xl py-12">
        <h1 className="text-3xl font-black">이용약관</h1>
        <p className="mt-2 text-sm text-spread-ink/60">시행일: 2026년 4월 23일</p>

        <div className="mt-10 grid gap-10 text-sm leading-7 text-spread-ink/80">
          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">제1조 (목적)</h2>
            <p>
              본 약관은 이상한회사(이하 "회사")가 운영하는 체험 미션 플랫폼 SPREAD(이하 "서비스")의 이용과 관련하여
              회사와 이용자 간의 권리·의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">제2조 (정의)</h2>
            <ul className="grid gap-2 pl-4">
              <li>① "서비스"란 회사가 제공하는 SPREAD 플랫폼 및 관련 제반 서비스를 의미합니다.</li>
              <li>② "이용자"란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.</li>
              <li>③ "멤버"란 체험 캠페인에 신청·참여하는 이용자를 말합니다.</li>
              <li>④ "광고주"란 체험 캠페인을 등록하고 운영하는 브랜드·사업자를 말합니다.</li>
              <li>⑤ "캠페인"이란 광고주가 등록한 체험 미션(제품 체험 또는 로컬 방문)을 말합니다.</li>
              <li>⑥ "제출물"이란 멤버가 캠페인 참여 후 업로드하는 게시물 URL, 본문, 스크린샷 등을 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">제3조 (약관의 효력 및 변경)</h2>
            <ul className="grid gap-2 pl-4">
              <li>① 본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다.</li>
              <li>② 회사는 합리적인 사유가 있을 경우 관련 법령에 위반되지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 7일 전 공지합니다.</li>
              <li>③ 이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">제4조 (서비스 이용 신청 및 회원가입)</h2>
            <ul className="grid gap-2 pl-4">
              <li>① 이용자는 회사가 정한 양식에 따라 가입 정보를 기입하고, 본 약관에 동의함으로써 가입을 신청합니다.</li>
              <li>② 만 14세 미만인 자는 서비스에 가입할 수 없습니다.</li>
              <li>③ 회사는 다음 각 호에 해당하는 경우 가입을 거절하거나 사후에 이용 계약을 해지할 수 있습니다.
                <ul className="mt-2 grid gap-1 pl-4">
                  <li>- 타인의 정보를 도용한 경우</li>
                  <li>- 허위 정보를 기재한 경우</li>
                  <li>- 기타 회사의 정책에 위반되는 경우</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">제5조 (캠페인 신청 및 참여)</h2>
            <ul className="grid gap-2 pl-4">
              <li>① 멤버는 서비스 내 공개된 캠페인에 신청할 수 있으며, 최종 선정은 광고주 또는 회사의 검토를 통해 결정됩니다.</li>
              <li>② 선정된 멤버는 캠페인에서 정한 기한 내에 제출물을 업로드해야 합니다.</li>
              <li>③ 제출물은 실제 본인이 작성하고 지정 채널에 게시한 콘텐츠여야 합니다. 허위·대리 제출은 즉시 제재 사유가 됩니다.</li>
              <li>④ 선정된 캠페인의 게시물은 캠페인 가이드라인에 명시된 기간(기본 6개월) 동안 게시 상태를 유지해야 합니다.</li>
              <li>⑤ 기한 내 미제출 시 회사 정책에 따라 이용 제한(패널티)이 부과될 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">제6조 (제출물 검수 및 승인)</h2>
            <ul className="grid gap-2 pl-4">
              <li>① 회사는 제출물에 대해 자동 또는 수동 검수를 진행하며, 검수 기준은 캠페인 가이드라인을 따릅니다.</li>
              <li>② 가이드라인 미충족(금지 표현 사용, 필수 키워드 누락 등) 시 제출물이 반려될 수 있습니다.</li>
              <li>③ 승인된 제출물에 대해 광고주가 약속한 혜택(제품, 방문 체험 등)이 제공됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">제7조 (이용자의 의무)</h2>
            <ul className="grid gap-2 pl-4">
              <li>① 이용자는 다음 행위를 해서는 안 됩니다.
                <ul className="mt-2 grid gap-1 pl-4">
                  <li>- 타인의 계정·정보를 도용하는 행위</li>
                  <li>- 허위 콘텐츠를 제출하거나 비공개 게시물로 제출하는 행위</li>
                  <li>- 동일 콘텐츠를 여러 캠페인에 중복 제출하는 행위</li>
                  <li>- 서비스 운영을 방해하거나 시스템에 무단으로 접근하는 행위</li>
                  <li>- 기타 관련 법령 또는 본 약관에 위반되는 행위</li>
                </ul>
              </li>
              <li>② 위반 행위 적발 시 회사는 사전 통보 없이 이용을 제한하거나 계정을 삭제할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">제8조 (회사의 의무)</h2>
            <ul className="grid gap-2 pl-4">
              <li>① 회사는 서비스의 안정적 운영을 위해 최선을 다합니다.</li>
              <li>② 회사는 이용자의 개인정보를 개인정보처리방침에 따라 보호합니다.</li>
              <li>③ 회사는 서비스 이용과 관련한 이용자의 불만을 신속히 처리하기 위해 노력합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">제9조 (서비스의 중단)</h2>
            <ul className="grid gap-2 pl-4">
              <li>① 회사는 시스템 점검, 통신 장애, 불가항력적 사유 등으로 서비스를 일시 중단할 수 있습니다.</li>
              <li>② 회사는 서비스 중단으로 인한 손해에 대해 고의 또는 중과실이 없는 한 책임을 지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">제10조 (면책조항)</h2>
            <ul className="grid gap-2 pl-4">
              <li>① 회사는 이용자가 서비스 내에 게시한 콘텐츠의 내용에 대해 책임을 지지 않습니다.</li>
              <li>② 회사는 이용자 간 또는 이용자와 제3자 간 분쟁에 대해 개입하지 않으며 이로 인한 손해를 배상하지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">제11조 (분쟁 해결)</h2>
            <p>본 약관과 관련하여 발생한 분쟁에 대해서는 대한민국 법률을 적용하며, 관할 법원은 회사 소재지를 관할하는 법원으로 합니다.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-spread-ink">문의</h2>
            <p>이용약관에 관한 문의는 아래로 연락주세요.</p>
            <p className="mt-2">이메일: <a href="mailto:dypapa0309@gmail.com" className="underline">dypapa0309@gmail.com</a></p>
          </section>
        </div>

        <div className="mt-12 border-t border-spread-ink/10 pt-6 text-xs text-spread-ink/50">
          <Link href="/" className="hover:text-spread-ink">← 홈으로</Link>
        </div>
      </Section>
    </AppShell>
  );
}
