import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui";

export const metadata: Metadata = { title: "개인정보 처리방침" };

export default function Privacy() {
  return (
    <>
      <PageHero photo="about" title="개인정보 처리방침" />
      <Section narrow>
        <div className="space-y-6 text-soft">
          <p><b className="text-ink">초안입니다.</b> 운영 주체와 법무 확인 후 확정 문구로 교체해 주세요.</p>
          <p>수집 항목: 이름, 이메일, 연락처, 거주 국가, 신청 시 입력하신 내용</p>
          <p>이용 목적: 신청 접수, 상담 및 안내, 모임·캠프 운영</p>
          <p>보관 기간: 목적 달성 시까지 (삭제를 요청하시면 지체 없이 파기)</p>
          <p>문의: 신청·문의 페이지를 통해 연락해 주세요.</p>
        </div>
      </Section>
    </>
  );
}
