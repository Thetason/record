import Link from "next/link"
import { ChevronLeftIcon } from "@radix-ui/react-icons"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/signup" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Re:cord</span>
              <span className="text-[#FF6B35]">*</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2">서비스 이용약관</h1>
          <p className="text-gray-600 mb-4">최종 수정일: 2025년 8월 11일 (법적 견고성 강화 개정)</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-amber-800">
              <strong>법률 고지:</strong> 본 약관은 정보 제공 목적의 템플릿입니다. 귀하의 상황에 맞는 구체적인 법률 자문을 위해서는 자격을 갖춘 변호사와 상담하시기 바랍니다.
            </p>
          </div>

          {/* 제1장 총칙 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제1장 총칙</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">제1조 (목적)</h3>
                <p className="text-gray-700 leading-relaxed">
                  이 약관은 Re:cord(이하 "회사")가 제공하는 리뷰 포트폴리오 서비스(이하 "서비스")의 이용과 관련하여 
                  회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제2조 (정의)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>"서비스"란 회사가 제공하는 리뷰 수집, 관리, 공개 프로필 생성, OCR 기반 리뷰 인식 등 일체의 서비스를 의미합니다.</li>
                  <li>"이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                  <li>"회원"이란 회사와 서비스 이용계약을 체결하고 이용자 아이디를 부여받은 이용자를 말합니다.</li>
                  <li>"리뷰"란 회원이 타 플랫폼에서 실제로 받은 진정한 평가 및 후기로, 조작되지 않은 원본 상태의 콘텐츠를 의미합니다.</li>
                  <li>"프로필"이란 회원의 검증된 리뷰를 모아 공개하는 포트폴리오 페이지를 의미합니다.</li>
                  <li>"제3자 플랫폼"이란 구글, 네이버, 카카오맵, 인스타그램 등 회원이 리뷰를 받은 외부 서비스를 의미합니다.</li>
                  <li>"OCR 서비스"란 이미지에서 텍스트를 자동으로 인식하여 리뷰 내용을 추출하는 기술을 의미합니다.</li>
                  <li>"콘텐츠"란 회원이 서비스에 게시한 리뷰, 이미지, 텍스트, 링크 등 모든 정보를 의미합니다.</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제3조 (약관의 효력 및 변경)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.</li>
                  <li>회사는 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
                  <li>약관의 중요한 내용이 변경되는 경우에는 적용일자 30일 이전부터, 그 외의 경우에는 7일 이전부터 공지합니다.</li>
                  <li>회원이 개정약관의 적용에 동의하지 않는 경우, 회원은 이용계약을 해지할 수 있습니다. 개정약관의 효력발생일까지 거부의사를 표시하지 않는 경우에는 개정약관에 동의한 것으로 간주합니다.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 제2장 회원가입 및 서비스 이용 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제2장 회원가입 및 서비스 이용</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">제4조 (회원가입)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관 및 개인정보처리방침에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
                  <li>회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                      <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                      <li>만 14세 미만인 경우 (법정대리인 동의 없는 경우)</li>
                      <li>이전에 회원자격을 상실한 적이 있는 경우 (단, 회사의 재가입 승낙을 얻은 경우는 제외)</li>
                      <li>허위 리뷰 작성 등으로 신뢰성에 문제가 있다고 판단되는 경우</li>
                      <li>반사회적 또는 미풍양속에 어긋나는 목적으로 신청한 경우</li>
                      <li>기타 회원으로 등록하는 것이 서비스 운영에 현저히 지장이 있다고 판단되는 경우</li>
                    </ul>
                  </li>
                  <li>회원가입계약의 성립 시기는 회사의 승낙이 회원에게 도달한 시점으로 합니다.</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제5조 (서비스의 제공)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>회사는 다음과 같은 서비스를 제공합니다:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>제3자 플랫폼 리뷰 수집 및 통합 관리 서비스</li>
                      <li>OCR 기반 리뷰 스크린샷 자동 인식 및 텍스트 변환 서비스</li>
                      <li>리뷰 진위성 검증 및 관리 서비스</li>
                      <li>공개 프로필 페이지 생성 및 커스터마이징 서비스</li>
                      <li>리뷰 통계, 분석 및 인사이트 제공 서비스</li>
                      <li>포트폴리오 공유 및 마케팅 도구 제공</li>
                      <li>기타 회사가 추가 개발하거나 제휴를 통해 제공하는 서비스</li>
                    </ul>
                  </li>
                  <li>서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다. 단, 다음의 경우 서비스 제공이 일시 중단될 수 있습니다:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>시스템 정기점검, 서버 업그레이드 및 기술적 점검</li>
                      <li>회사의 제어 범위를 벗어난 네트워크 장애</li>
                      <li>천재지변, 비상사태, 정전, 서비스 설비의 장애 등</li>
                    </ul>
                  </li>
                  <li>회사는 서비스 개선을 위해 사전 공지 후 서비스의 내용을 변경할 수 있으며, 이로 인해 발생한 손해에 대해서는 책임지지 않습니다.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 제3장 회원의 의무 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제3장 회원의 의무</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">제6조 (회원의 의무)</h3>
                <p className="text-gray-700 mb-3">회원은 다음 행위를 하여서는 안 되며, 이를 위반할 경우 서비스 이용 제한, 계약 해지 등의 조치를 받을 수 있습니다:</p>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>신청 또는 변경 시 허위 내용의 등록</li>
                  <li>타인의 정보를 도용하거나 부정하게 사용하는 행위</li>
                  <li>회사가 게시한 정보의 무단 변경, 삭제, 훼손</li>
                  <li>컴퓨터 바이러스, 악성 코드 등 유해한 프로그램의 게시 또는 전송</li>
                  <li>회사와 기타 제3자의 저작권, 특허권, 상표권 등 지적재산권에 대한 침해</li>
                  <li>회사, 다른 회원 및 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li><strong>허위, 과장, 조작된 리뷰의 등록 (가장 중요)</strong></li>
                  <li>타인의 리뷰를 무단으로 도용, 복사, 편집하여 자신의 것으로 게시하는 행위</li>
                  <li>실제 경험하지 않은 서비스에 대한 가짜 리뷰 작성</li>
                  <li>리뷰 대가로 금전적 보상을 받고 작성된 리뷰를 일반 리뷰로 가장하여 등록하는 행위</li>
                  <li>동일한 서비스에 대해 중복으로 여러 개의 리뷰를 작성하는 행위</li>
                  <li>욕설, 비방, 혐오 표현이 포함된 리뷰 작성</li>
                  <li>개인정보, 연락처, 광고성 내용이 포함된 리뷰 작성</li>
                  <li>회사의 사전 승인 없이 서비스를 상업적 목적으로 이용하는 행위</li>
                  <li>서비스 보안 체계를 위협하거나 시스템에 무단 접근을 시도하는 행위</li>
                  <li>기타 관련 법령에 위배되거나 미풍양속에 반하는 행위</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제7조 (리뷰의 진실성 및 검증)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>회원은 본인이 실제로 제공한 서비스에 대해 진정한 고객으로부터 받은 리뷰만을 등록해야 합니다.</li>
                  <li>회원은 등록하는 모든 리뷰의 진실성과 정확성에 대해 전적인 책임을 집니다.</li>
                  <li>회사는 다음과 같은 방법으로 리뷰의 진위성을 검증할 수 있습니다:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>원본 리뷰 플랫폼과의 데이터 대조</li>
                      <li>리뷰 작성 패턴 및 이상 징후 분석</li>
                      <li>회원의 서비스 제공 이력과 리뷰 내용 일치성 확인</li>
                      <li>제3자 신고 및 검토 시스템 운영</li>
                      <li>AI 및 머신러닝 기반 허위 리뷰 탐지 시스템</li>
                      <li>메타데이터 분석을 통한 리뷰 원본성 확인</li>
                    </ul>
                  </li>
                  <li>허위 리뷰가 확인된 경우, 회사는 다음 조치를 취할 수 있습니다:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>해당 리뷰의 즉시 삭제</li>
                      <li>회원에게 경고 및 해명 요구</li>
                      <li>일정 기간 서비스 이용 제한</li>
                      <li>중대하거나 반복적인 위반 시 회원 자격 영구 정지</li>
                      <li>관련 법령에 따른 법적 조치</li>
                      <li>손해 배상 청구 및 민사 소송 제기</li>
                    </ul>
                  </li>
                  <li>회원은 리뷰의 진위성 검증에 필요한 자료 제공에 협조해야 하며, 정당한 사유 없이 협조를 거부할 경우 허위 리뷰로 간주될 수 있습니다.</li>
                  <li><strong>허위 리뷰 등록으로 인한 법적 책임:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>회원은 허위 리뷰로 인해 회사 또는 제3자에게 발생한 모든 손해에 대해 배상할 책임을 집니다.</li>
                      <li>허위 리뷰가 부정경쟁방지법, 전자상거래법, 형법상 업무방해죄 등에 해당할 경우 관련 법령에 따른 민·형사상 책임을 집니다.</li>
                      <li>회사는 허위 리뷰로 인한 피해에 대해 관계 기관에 신고 및 고발할 수 있습니다.</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제8조 (콘텐츠의 관리 및 삭제)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>회사는 회원이 게시한 콘텐츠가 다음에 해당한다고 판단되는 경우 사전 통지 없이 삭제하거나 이용을 제한할 수 있습니다:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>본 약관을 위반하는 내용</li>
                      <li>타인의 권리를 침해하거나 명예를 훼손하는 내용</li>
                      <li>공공질서 및 미풍양속에 위배되는 내용</li>
                      <li>범죄와 결부된다고 객관적으로 인정되는 내용</li>
                      <li>회사의 저작권, 제3자의 저작권 등 기타 권리를 침해하는 내용</li>
                      <li>기타 관련 법령에 위배되는 내용</li>
                    </ul>
                  </li>
                  <li>회원은 자신이 게시한 콘텐츠에 대해 언제든지 수정 또는 삭제할 수 있습니다.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 제4장 개인정보보호 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제4장 개인정보보호</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">제9조 (개인정보의 보호)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>회사는 「개인정보보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령에 따라 이용자의 개인정보를 보호합니다.</li>
                  <li>개인정보의 수집, 이용, 제공, 위탁, 보관, 파기 등에 관한 상세한 사항은 개인정보처리방침을 따릅니다.</li>
                  <li>회사는 관련 법령이 정하는 바에 의하지 아니하고는 회원의 개인정보를 타인에게 제공하지 않습니다.</li>
                  <li>회원은 개인정보의 수집, 이용, 제공에 대한 동의를 거부할 권리가 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 제5장 책임 및 면책 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제5장 책임 및 면책</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">제10조 (회사의 의무)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>회사는 관련 법령과 이 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 계속적이고 안정적으로 서비스를 제공하기 위하여 최선을 다합니다.</li>
                  <li>회사는 회원의 개인정보보호를 위한 기술적, 관리적 보안 조치를 취하고 이를 지속적으로 개선합니다.</li>
                  <li>회사는 이용자의 신뢰성 있는 리뷰 포트폴리오 구축을 위해 리뷰 진위성 검증 시스템을 운영합니다.</li>
                  <li>회사는 서비스 이용과 관련하여 회원으로부터 제기되는 의견이나 불만이 정당하다고 인정할 경우 이를 신속히 처리합니다.</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제11조 (회사의 면책)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지, 정전, 정부의 규제 등 회사의 귀책사유가 아닌 불가항력으로 인한 서비스 중단에 대해서는 책임을 지지 않습니다.</li>
                  <li>회사는 회원의 고의 또는 과실로 인한 서비스 이용의 장애 및 손해에 대하여는 책임을 지지 않습니다.</li>
                  <li><strong>리뷰 콘텐츠 관련 면책:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>회사는 단순히 리뷰를 게시할 수 있는 플랫폼을 제공하는 중개자로서, 회원이 게시한 리뷰 및 콘텐츠의 진실성, 정확성, 적법성에 대하여 보증하지 않습니다.</li>
                      <li>회사는 허위 리뷰 방지를 위한 합리적 노력을 다하나, 모든 허위 리뷰의 완전한 차단을 보장하지는 않습니다.</li>
                      <li>회원이 게시한 리뷰로 인한 명예훼손, 모독, 사생활 침해 등의 문제에 대해서는 해당 회원이 모든 책임을 집니다.</li>
                      <li>회사는 리뷰의 내용이나 품질에 대해 어떠한 보증도 하지 않으며, 리뷰 기반 의사결정으로 인한 손해에 대해 책임지지 않습니다.</li>
                    </ul>
                  </li>
                  <li><strong>지적재산권 관련 면책:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>회원이 제3자 플랫폼에서 수집한 리뷰의 저작권, 초상권, 개인정보보호 등 권리 침해 문제에 대해서는 해당 회원이 모든 책임을 집니다.</li>
                      <li>회원은 타인의 지적재산권을 침해하는 콘텐츠 게시로 인한 모든 법적 분쟁과 손해를 회사에 대해 면책시켜야 합니다.</li>
                    </ul>
                  </li>
                  <li><strong>제3자 플랫폼 관련 면책:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>회사는 구글, 네이버, 카카오맵 등 제3자 플랫폼의 정책 변경, 서비스 중단, API 제한 등으로 인한 서비스 이용 제한에 대해 책임지지 않습니다.</li>
                      <li>제3자 플랫폼에서의 계정 정지, 리뷰 삭제 등으로 인한 손해에 대해 회사는 책임을 지지 않습니다.</li>
                    </ul>
                  </li>
                  <li>회사는 회원 간 또는 회원과 제3자 간에 서비스를 매개로 발생한 분쟁에 대해 개입 또는 해결할 의무가 없으며, 이에 따른 손해를 배상할 책임이 없습니다.</li>
                  <li>회사는 무료로 제공하는 서비스 이용과 관련하여 회원에게 발생한 손해에 대해서는 책임을 지지 않습니다.</li>
                  <li><strong>서비스 품질 보증:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>회사는 안정적인 서비스 제공을 위해 최선을 다하며, 서비스 중단 등으로 인한 불편을 최소화하도록 노력합니다.</li>
                      <li>서비스 이용과 관련하여 발생할 수 있는 문제에 대해서는 관련 법령이 정하는 범위 내에서 합리적인 해결책을 제공합니다.</li>
                      <li>다만, 천재지변, 불가항력, 회원의 귀책사유, 제3자의 불법행위로 인한 손해에 대해서는 법령에서 정한 경우를 제외하고 책임을 지지 않습니다.</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* 제6장 기타 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제6장 기타</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">제12조 (저작권 및 지적재산권)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li><strong>서비스 저작권:</strong> 서비스의 디자인, 소프트웨어, 알고리즘, 데이터베이스 등 모든 저작권 및 지적재산권은 회사에 귀속됩니다.</li>
                  <li><strong>리뷰 콘텐츠 저작권 및 사용권:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>제3자 플랫폼에서 수집한 리뷰의 저작권은 원 작성자(고객)에게 귀속되며, 회원은 해당 리뷰를 자신의 포트폴리오에 전시할 수 있는 사용권만을 보유합니다.</li>
                      <li>회원이 직접 작성한 부가 설명, 소개글 등의 저작권은 해당 회원에게 귀속됩니다.</li>
                      <li>OCR로 추출한 텍스트의 저작권은 원본 리뷰 작성자에게 귀속되며, 회원은 포트폴리오 목적으로만 사용할 수 있습니다.</li>
                    </ul>
                  </li>
                  <li><strong>회사에 부여하는 사용권:</strong> 회원은 서비스에 콘텐츠를 게시함으로써 다음 권리를 회사에 부여합니다:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>서비스 제공을 위한 복제, 전송, 전시, 배포의 권리</li>
                      <li>서비스 개선 및 마케팅을 위한 편집 및 2차 저작물 작성의 권리 (익명화 처리)</li>
                      <li>검색 엔진 최적화 및 서비스 홍보 시 해당 콘텐츠를 노출하는 권리</li>
                      <li>통계 분석 및 서비스 개선을 위한 데이터 활용 권리</li>
                    </ul>
                  </li>
                  <li><strong>저작권 침해 방지 의무:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>회원은 타인의 저작권, 초상권, 개인정보, 영업비밀 등 권리를 침해하는 콘텐츠를 게시해서는 안 됩니다.</li>
                      <li>회원은 리뷰 수집 시 해당 플랫폼의 이용약관과 저작권법을 준수해야 합니다.</li>
                      <li>저작권 침해 신고가 접수된 경우, 회사는 관련 콘텐츠를 임시 차단하고 회원에게 소명을 요구할 수 있습니다.</li>
                    </ul>
                  </li>
                  <li><strong>상업적 이용 제한:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>회원은 서비스를 통해 얻은 타 회원의 정보를 회사의 사전 승낙 없이 상업적 목적으로 이용하거나 제3자에게 제공할 수 없습니다.</li>
                      <li>대량의 데이터 수집, 크롤링, 스크래핑 등의 행위는 금지됩니다.</li>
                    </ul>
                  </li>
                  <li><strong>DMCA 준수:</strong> 회사는 저작권 침해 신고에 대해 신속하게 대응하며, 반복적인 저작권 침해자의 계정을 정지할 수 있습니다.</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제13조 (명예훼손 및 법적 분쟁 대응)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li><strong>명예훼손 방지 의무:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>회원은 리뷰 작성 시 타인의 명예를 훼손하거나 모독하는 내용을 포함하지 않아야 합니다.</li>
                      <li>사실에 기반한 객관적 평가를 넘어서는 인신공격, 욕설, 비방은 금지됩니다.</li>
                      <li>개인의 사생활이나 민감정보를 공개하는 리뷰는 금지됩니다.</li>
                    </ul>
                  </li>
                  <li><strong>신고 및 대응 시스템:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>명예훼손, 모독, 허위사실 유포 등의 신고가 접수되면 회사는 즉시 해당 콘텐츠를 임시 차단합니다.</li>
                      <li>신고 접수 후 7일 이내에 조사를 완료하고, 필요시 관련 전문가의 자문을 구할 수 있습니다.</li>
                      <li>명예훼손이 명백한 경우 해당 콘텐츠를 영구 삭제하고 작성자에게 경고 조치합니다.</li>
                    </ul>
                  </li>
                  <li><strong>법적 분쟁 발생시 대응:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>회원의 리뷰로 인해 법적 분쟁이 발생한 경우, 해당 회원이 모든 법적 책임을 집니다.</li>
                      <li>회사는 법원이나 수사기관의 정당한 요청시 관련 정보를 제공할 수 있습니다.</li>
                      <li>회원은 자신의 행위로 인해 회사가 입은 손해를 배상할 의무가 있습니다.</li>
                    </ul>
                  </li>
                  <li><strong>정정·반박권 보장:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>리뷰의 대상이 된 개인이나 사업자는 사실 확인을 요청할 수 있습니다.</li>
                      <li>명백한 사실 오인이 확인된 경우 해당 리뷰에 정정 안내를 표시할 수 있습니다.</li>
                      <li>정당한 반박 요청이 있는 경우 이를 해당 리뷰와 함께 표시할 수 있습니다.</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제14조 (계약 해지 및 이용 제한)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>회원은 언제든지 서비스 설정 메뉴 등을 통하여 이용계약 해지 신청을 할 수 있으며, 회사는 관련 법령 등이 정하는 바에 따라 이를 즉시 처리합니다.</li>
                  <li>회사는 회원이 다음 각 호에 해당하는 행위를 하였을 때 사전 통지 없이 이용계약을 해지하거나 또는 기간을 정하여 서비스 이용을 중단할 수 있습니다:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>가입 신청 시 허위 내용을 등록한 경우</li>
                      <li>허위 리뷰를 반복적으로 등록하는 경우</li>
                      <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 경우</li>
                      <li>서비스를 이용하여 법령과 본 약관이 금지하는 행위를 하는 경우</li>
                      <li>기타 중대한 사유로 서비스 이용을 지속하기 어려운 경우</li>
                    </ul>
                  </li>
                  <li>이용계약이 해지되면 관련 법령 및 개인정보처리방침에 따라 회원정보를 보유하는 경우를 제외하고 해당 회원의 모든 데이터는 삭제됩니다.</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제15조 (한국 법령 준수)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li><strong>개인정보보호법 준수:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>회사는 「개인정보보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 따라 회원의 개인정보를 처리합니다.</li>
                      <li>OCR 처리 과정에서 식별되는 개인정보는 즉시 삭제하거나 익명화 처리합니다.</li>
                      <li>제3자 플랫폼에서 수집한 리뷰에 포함된 개인정보는 최소화하여 처리합니다.</li>
                    </ul>
                  </li>
                  <li><strong>전자상거래법 및 공정거래법 준수:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>리뷰의 대가성 및 광고성이 명확히 구분되어야 하며, 협찬 리뷰는 명시적으로 표시됩니다.</li>
                      <li>소비자를 기만하거나 오인시킬 수 있는 허위·과장 리뷰는 엄격히 금지됩니다.</li>
                      <li>사업자의 부당한 리뷰 조작 행위 발견시 관련 기관에 신고할 수 있습니다.</li>
                    </ul>
                  </li>
                  <li><strong>부정경쟁방지법 준수:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>경쟁사에 대한 허위 리뷰 작성은 부정경쟁행위로 간주되어 법적 제재를 받을 수 있습니다.</li>
                      <li>타인의 영업을 방해할 목적의 허위 리뷰는 엄격히 금지됩니다.</li>
                    </ul>
                  </li>
                  <li><strong>정보통신망법 준수:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>스팸 및 불법 광고성 정보 전송은 금지됩니다.</li>
                      <li>타인의 권리를 침해하는 정보의 유통을 방지하기 위해 노력합니다.</li>
                      <li>온라인상 명예훼손 및 모독에 대해 신속한 대응 체계를 운영합니다.</li>
                    </ul>
                  </li>
                  <li><strong>저작권법 준수:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>제3자 플랫폼의 리뷰 수집시 해당 플랫폼의 저작권 정책을 준수합니다.</li>
                      <li>타인의 창작물(사진, 동영상 등)이 포함된 리뷰의 무단 복제를 방지합니다.</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제16조 (분쟁해결 및 준거법)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>회사는 이용자로부터 제출되는 불만사항 및 의견을 신속하게 처리합니다. 다만, 신속한 처리가 곤란한 경우에는 이용자에게 그 사유와 처리일정을 통보합니다.</li>
                  <li>회사와 이용자 간에 발생한 전자상거래 분쟁에 관하여는 소비자분쟁조정위원회의 조정에 따를 수 있습니다.</li>
                  <li>회사와 이용자 간에 제기되는 소송은 대한민국 법을 준거법으로 하며, 회사의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.</li>
                  <li>이 약관에 명시되지 않은 사항은 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령에 따릅니다.</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제17조 (기타)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>본 약관은 대한민국 법령에 의해 규율되고 해석됩니다.</li>
                  <li>본 약관의 일부 조항이 관련 법령에 의해 무효로 판단되더라도 나머지 조항의 유효성에는 영향을 미치지 않습니다.</li>
                  <li>회사의 연락처는 다음과 같습니다:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>상호: Re:cord (리코드)</li>
                      <li>이메일: support@record.kr</li>
                      <li>주소: [실제 주소 입력 필요]</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* 부칙 */}
          <section className="mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">부칙</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>제1조 (시행일)</strong> 이 약관은 2025년 8월 11일부터 시행됩니다.</p>
                <p><strong>제2조 (경과조치)</strong> 이 약관 시행 이전에 가입한 회원들은 본 약관에 동의한 것으로 간주됩니다.</p>
                <p><strong>제3조 (기존 데이터)</strong> 약관 시행 전에 등록된 리뷰는 소급 적용하여 진위성 검증 대상에 포함됩니다.</p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">문의사항</h3>
            <p className="text-gray-700">
              본 약관에 대한 문의사항이 있으신 경우 아래로 연락주시기 바랍니다.
            </p>
            <ul className="mt-3 space-y-1 text-gray-700">
              <li>• 이메일: support@record.kr</li>
              <li>• 고객센터: 평일 09:00 - 18:00</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}