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
          <p className="text-gray-600 mb-8">최종 수정일: 2025년 8월 11일</p>

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
                  <li>"서비스"란 회사가 제공하는 리뷰 수집, 관리, 공개 프로필 생성 등 일체의 서비스를 의미합니다.</li>
                  <li>"이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                  <li>"회원"이란 회사와 서비스 이용계약을 체결하고 이용자 아이디를 부여받은 이용자를 말합니다.</li>
                  <li>"리뷰"란 회원이 타 플랫폼에서 받은 평가 및 후기를 의미합니다.</li>
                  <li>"프로필"이란 회원의 리뷰를 모아 공개하는 페이지를 의미합니다.</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제3조 (약관의 효력 및 변경)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.</li>
                  <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
                  <li>개정된 약관은 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일자 7일 이전부터 공지합니다.</li>
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
                  <li>이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
                  <li>회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                      <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                      <li>기타 회원으로 등록하는 것이 서비스 운영에 현저히 지장이 있다고 판단되는 경우</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제5조 (서비스의 제공)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>회사는 다음과 같은 서비스를 제공합니다:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>리뷰 수집 및 관리 서비스</li>
                      <li>공개 프로필 페이지 생성 서비스</li>
                      <li>리뷰 통계 및 분석 서비스</li>
                      <li>기타 회사가 추가 개발하거나 제휴를 통해 제공하는 서비스</li>
                    </ul>
                  </li>
                  <li>서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다. 단, 시스템 정기점검 등의 필요로 인하여 서비스가 일시 중단될 수 있습니다.</li>
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
                <p className="text-gray-700 mb-3">회원은 다음 행위를 하여서는 안 됩니다:</p>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>신청 또는 변경 시 허위 내용의 등록</li>
                  <li>타인의 정보 도용</li>
                  <li>회사가 게시한 정보의 변경</li>
                  <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                  <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>허위 또는 조작된 리뷰의 등록</li>
                  <li>타인의 리뷰를 무단으로 도용하는 행위</li>
                  <li>서비스를 이용하여 영리 목적의 활동을 하는 행위</li>
                  <li>기타 불법적이거나 부당한 행위</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제7조 (리뷰의 진실성)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>회원은 본인이 실제로 받은 리뷰만을 등록해야 합니다.</li>
                  <li>회원은 리뷰의 진실성에 대한 책임을 집니다.</li>
                  <li>허위 리뷰 등록이 확인될 경우, 회사는 해당 리뷰를 삭제하고 회원 자격을 제한할 수 있습니다.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 제4장 개인정보보호 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제4장 개인정보보호</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">제8조 (개인정보의 보호)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>회사는 이용자의 개인정보를 보호하기 위하여 개인정보보호법 등 관련 법령을 준수합니다.</li>
                  <li>개인정보의 수집, 이용, 제공, 보관 등에 관한 상세한 사항은 개인정보처리방침을 따릅니다.</li>
                  <li>회사는 회원의 개인정보를 본인의 동의 없이 타인에게 제공하지 않습니다.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 제5장 책임 및 면책 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제5장 책임 및 면책</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">제9조 (회사의 의무)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>회사는 관련 법령과 이 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 계속적이고 안정적으로 서비스를 제공하기 위하여 최선을 다합니다.</li>
                  <li>회사는 회원이 안전하게 서비스를 이용할 수 있도록 개인정보보호를 위한 보안 시스템을 구축합니다.</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제10조 (면책조항)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
                  <li>회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
                  <li>회사는 회원이 게시한 리뷰의 정확성, 진실성에 대하여 책임을 지지 않습니다.</li>
                  <li>회사는 회원 간 또는 회원과 제3자 간에 서비스를 매개로 발생한 분쟁에 대해 책임을 지지 않습니다.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 제6장 기타 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제6장 기타</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">제11조 (저작권의 귀속)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>서비스에 대한 저작권 및 지적재산권은 회사에 귀속됩니다.</li>
                  <li>회원이 서비스 내에 게시한 리뷰 등 콘텐츠의 저작권은 해당 회원에게 귀속됩니다.</li>
                  <li>회원은 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">제12조 (분쟁해결)</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>회사와 회원 간에 발생한 분쟁은 상호 협의하여 해결하는 것을 원칙으로 합니다.</li>
                  <li>이 약관에 명시되지 않은 사항은 관련 법령 또는 상관례에 따릅니다.</li>
                  <li>서비스 이용으로 발생한 분쟁에 대한 소송은 민사소송법상의 관할법원에 제기합니다.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 부칙 */}
          <section className="mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">부칙</h2>
              <p className="text-gray-700">이 약관은 2025년 8월 11일부터 시행됩니다.</p>
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