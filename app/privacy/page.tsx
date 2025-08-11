import Link from "next/link"
import { ChevronLeftIcon } from "@radix-ui/react-icons"

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold mb-2">개인정보처리방침</h1>
          <div className="mb-8">
            <p className="text-gray-600 mb-2">최종 수정일: 2025년 8월 11일 | 시행일: 2025년 8월 11일</p>
            <p className="text-sm text-blue-600">버전: v2.0 (2023년 개정법 및 OCR 기능 반영)</p>
          </div>

          {/* 개요 */}
          <section className="mb-8">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Re:cord</strong>(이하 "회사" 또는 "리코드")는 이용자의 개인정보를 중요시하며, 
                「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 
                「전자상거래 등에서의 소비자보호에 관한 법률」 등 개인정보 보호 관련 법령을 
                준수하고 있습니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                본 개인정보처리방침은 회사가 제공하는 리뷰 포트폴리오 플랫폼 서비스(이하 "서비스")에서 
                개인정보가 어떻게 수집·이용·처리되고 있는지, 특히 OCR(광학 문자 인식) 기술을 
                통한 이미지 처리 과정에서의 개인정보 처리 방식과 보호 조치에 대해 
                상세히 알려드립니다.
              </p>
            </div>
          </section>

          {/* 1. 수집하는 개인정보 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. 수집하는 개인정보 항목 및 수집 방법</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">가. 수집하는 개인정보 항목</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold mb-2">필수 수집 항목</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>회원가입 시: 이메일, 비밀번호, 이름, 사용자명(닉네임)</li>
                    <li>서비스 이용 시: 리뷰 내용, 평점, 업체명, 리뷰 작성일</li>
                    <li>자동 수집: 접속 IP, 접속 기기 정보, 서비스 이용 기록, 쿠키</li>
                    <li>OCR 처리 과정에서 수집되는 정보: 업로드된 이미지에서 추출된 텍스트 정보, 이미지 메타데이터</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold mb-2">선택 수집 항목</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>프로필 정보: 프로필 사진, 자기소개, 경력 사항</li>
                    <li>SNS 연동 정보: 인스타그램, 웹사이트 URL</li>
                    <li>리뷰 관련: 리뷰 스크린샷 이미지 파일, 원본 링크</li>
                    <li>제3자 플랫폼 연동: 네이버, 구글, 카카오맵 등 플랫폼에서 공개된 리뷰 정보</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-red-800">민감정보 처리 관련 고지</h4>
                  <p className="text-sm text-red-700">
                    회사는 원칙적으로 사상·신념, 정치적 견해, 건강, 성생활 등에 관한 민감정보를 
                    수집하지 않습니다. 다만, 이용자가 리뷰 내용에 자발적으로 포함시킨 경우 
                    별도의 동의를 받아 처리할 수 있습니다.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">나. 개인정보 수집 방법</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>회원가입 및 서비스 이용 과정에서 이용자가 직접 입력</li>
                  <li>서비스 이용 과정에서 자동으로 수집(접속 로그, 이용 기록 등)</li>
                  <li>OCR 기술을 통한 이미지 내 텍스트 자동 추출</li>
                  <li>제3자 플랫폼 API를 통한 공개 리뷰 정보 수집</li>
                  <li>고객센터를 통한 상담 과정에서 수집</li>
                  <li>쿠키, 웹 비콘 등 자동 수집 장치를 통한 수집</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. 개인정보 이용 목적 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. 개인정보의 수집 및 이용 목적</h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-[#FF6B35] pl-4">
                <h3 className="font-semibold mb-2">회원 관리</h3>
                <p className="text-gray-700">
                  회원제 서비스 이용에 따른 본인 확인, 개인 식별, 불량회원의 부정 이용 방지와 
                  비인가 사용 방지, 가입 의사 확인, 연령 확인, 분쟁 조정을 위한 기록 보존, 
                  불만 처리 등 민원 처리, 고지사항 전달
                </p>
              </div>

              <div className="border-l-4 border-[#FF6B35] pl-4">
                <h3 className="font-semibold mb-2">서비스 제공</h3>
                <p className="text-gray-700">
                  리뷰 포트폴리오 생성 및 관리, 공개 프로필 페이지 제공, 리뷰 통계 및 분석 제공, 
                  OCR 기술을 활용한 리뷰 스크린샷 자동 인식 및 텍스트 추출, 
                  제3자 플랫폼 리뷰 데이터 연동, 맞춤형 서비스 제공, 콘텐츠 제공
                </p>
              </div>

              <div className="border-l-4 border-[#FF6B35] pl-4">
                <h3 className="font-semibold mb-2">마케팅 및 광고</h3>
                <p className="text-gray-700">
                  신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여 기회 제공, 
                  인구통계학적 특성에 따른 서비스 제공 및 광고 게재, 서비스의 유효성 확인, 
                  접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계
                </p>
              </div>

              <div className="border-l-4 border-[#FF6B35] pl-4">
                <h3 className="font-semibold mb-2">가명정보 처리</h3>
                <p className="text-gray-700">
                  통계 작성, 과학적 연구, 공익적 기록보존 등을 위한 가명정보 처리. 
                  이 경우 개인을 알아볼 수 없도록 가명처리하여 통계적 목적으로만 이용합니다.
                </p>
              </div>
            </div>
          </section>

          {/* 3. 개인정보 보유 및 이용 기간 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. 개인정보의 보유 및 이용 기간</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                <strong>원칙:</strong> 이용자의 개인정보는 개인정보의 수집 및 이용목적이 달성되면 
                지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">가. 회사 내부 방침에 의한 정보 보유</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>부정 이용 기록: 보존 기간 1년</li>
                    <li>회원 탈퇴 후 재가입 방지: 보존 기간 3개월</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">나. 관련 법령에 의한 정보 보유</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
                    <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
                    <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
                    <li>표시/광고에 관한 기록: 6개월 (전자상거래법)</li>
                    <li>웹사이트 방문 기록: 3개월 (통신비밀보호법)</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 4. 개인정보 제3자 제공 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. 개인정보의 제3자 제공</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-gray-700">
                회사는 원칙적으로 이용자의 개인정보를 제1조에서 명시한 목적 범위 내에서 처리하며, 
                이용자의 사전 동의 없이 본래의 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다. 
                다만, 다음의 경우에는 예외로 합니다:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-gray-700">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </div>
          </section>

          {/* 5. 개인정보 처리 위탁 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. 개인정보 처리 위탁</h2>
            
            <p className="text-gray-700 mb-4">
              회사는 서비스 향상을 위해 아래와 같이 개인정보를 위탁하고 있으며, 
              관계 법령에 따라 위탁계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">위탁받는 자</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">위탁 업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Vercel Inc.</td>
                    <td className="border border-gray-300 px-4 py-2">웹사이트 호스팅 및 배포</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Supabase Inc.</td>
                    <td className="border border-gray-300 px-4 py-2">데이터베이스 관리</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Google Cloud Platform</td>
                    <td className="border border-gray-300 px-4 py-2">OCR 서비스 제공</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. 이용자의 권리 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. 이용자 및 법정대리인의 권리와 행사 방법</h2>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며, 
                회원 탈퇴를 통해 개인정보의 수집 및 이용에 대한 동의를 철회할 수 있습니다.
              </p>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">이용자의 권리</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>개인정보 열람 요구</li>
                  <li>오류 등이 있을 경우 정정 요구</li>
                  <li>삭제 요구</li>
                  <li>처리 정지 요구</li>
                </ul>
              </div>

              <p className="text-gray-700">
                위 권리 행사는 서비스 내 '프로필 설정' 메뉴를 통해 직접 열람, 정정, 삭제가 가능하며, 
                고객센터(support@record.kr)를 통해 서면, 전화, 이메일로도 가능합니다.
              </p>
            </div>
          </section>

          {/* 7. 개인정보 파기 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. 개인정보 파기 절차 및 방법</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">파기 절차</h3>
                <p className="text-gray-700">
                  이용자가 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져 
                  내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다.
                  단, 다른 법령에 특별한 규정이 있는 경우에는 해당 규정에 따라 보존합니다.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">파기 방법</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>전자적 파일 형태: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                  <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 8. 개인정보 보호책임자 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. 개인정보 보호책임자</h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 
                이용자의 불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">개인정보 보호책임자</h3>
                  <ul className="mt-2 space-y-1 text-gray-700">
                    <li>• 성명: 서영빈</li>
                    <li>• 직책: 대표</li>
                    <li>• 이메일: privacy@record.kr</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">개인정보 보호 담당부서</h3>
                  <ul className="mt-2 space-y-1 text-gray-700">
                    <li>• 부서명: 개인정보보호팀</li>
                    <li>• 이메일: support@record.kr</li>
                    <li>• 연락처: 평일 09:00 - 18:00</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 9. 개인정보 자동 수집 장치 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. 개인정보 자동 수집 장치의 설치·운영 및 거부</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">쿠키(Cookie)란?</h3>
                <p className="text-gray-700">
                  회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 이용정보를 저장하고 
                  수시로 불러오는 '쿠키(cookie)'를 사용합니다. 쿠키는 웹사이트를 운영하는데 
                  이용되는 서버가 이용자의 컴퓨터 브라우저에 보내는 소량의 정보이며, 
                  이용자의 컴퓨터 하드디스크에 저장되기도 합니다.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">쿠키의 사용 목적</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>로그인 상태 유지</li>
                  <li>이용자의 선호 설정 저장</li>
                  <li>서비스 이용 통계 분석</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">쿠키 설정 거부 방법</h3>
                <p className="text-gray-700">
                  이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 웹브라우저 설정을 통해 
                  모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 
                  모든 쿠키의 저장을 거부할 수 있습니다.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  ※ 쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스 이용에 어려움이 있을 수 있습니다.
                </p>
              </div>
            </div>
          </section>

          {/* 10. 개인정보의 안전성 확보 조치 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. 개인정보의 안전성 확보 조치</h2>
            
            <p className="text-gray-700 mb-4">
              회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">기술적 조치</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                  <li>개인정보 암호화</li>
                  <li>해킹 등에 대비한 보안프로그램 설치</li>
                  <li>접속기록의 보관 및 위변조 방지</li>
                  <li>SSL 인증서를 통한 데이터 전송 암호화</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">관리적 조치</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                  <li>개인정보 취급 직원의 최소화</li>
                  <li>정기적인 직원 교육 실시</li>
                  <li>내부관리계획 수립 및 시행</li>
                  <li>개인정보 접근 권한 관리</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 11. 손해배상 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. 손해배상 및 분쟁조정</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold mb-3 text-blue-800">손해배상 책임 (개인정보보호법 제39조)</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">가. 배상책임의 범위</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>개인정보의 수집·유출·오남·위조 등으로 인한 정신적 피해</li>
                      <li>개인정보 오남으로 인한 재산상 피해</li>
                      <li>OCR 처리 과정에서의 오류나 개인정보 오남</li>
                      <li>제3자 서비스 연동 과정에서의 데이터 오남</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">나. 배상 범위</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>정신적 피해: 1인당 일일 10만원 이하 배상 (최대 300만원)</li>
                      <li>재산상 피해: 실제 손해 범위 내에서 배상</li>
                      <li>법정손해배상: 개인정보보호법 제39조의 2 규정에 따른 배상</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">다. 면책사유</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>이용자의 고의 또는 중대한 과실로 인한 피해</li>
                      <li>제3자의 불법행위로 인한 피해</li>
                      <li>천재지변이나 전쟁 등 불가항력으로 인한 피해</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-3">분쟁조정 절차</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">1. 내부 처리 절차</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>고지 접수 후 7일 이내 사실확인 및 답변</li>
                      <li>15일 이내 해결방안 제시 및 협의</li>
                      <li>30일 이내 최종 처리결과 통보</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">2. 외부 분쟁조정</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>개인정보보호위원회 개인정보 분쟁조정위원회</li>
                      <li>대한변호사협회 개인정보 분쟁조정센터</li>
                      <li>소비자분쟁조정위원회</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 12. 개정 이력 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. 개인정보처리방침의 변경</h2>
            
            <p className="text-gray-700 mb-4">
              이 개인정보처리방침은 2025년 8월 11일부터 적용되며, 법령 및 방침에 따른 
              변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 
              공지사항을 통하여 고지할 것입니다.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">개정 이력</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• 2025년 8월 11일: 개인정보처리방침 제정</li>
                <li>• 2025년 8월 11일: OCR 처리 및 2023년 개정법 반영 전면 개정</li>
              </ul>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-orange-800">법률 준수 현황</h3>
              <div className="text-sm text-orange-700 space-y-2">
                <p><strong>• 개인정보보호법:</strong> 2020.8.5. 개정, 2023.9.15. 최신개정 사항 반영</p>
                <p><strong>• 정보통신망법:</strong> 2020.12.10. 개정 사항 반영</p>
                <p><strong>• 전자상거래법:</strong> 2021.7.14. 개정 사항 반영</p>
                <p><strong>• 위치정보보호법:</strong> 2020.6.9. 시행 사항 반영</p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">문의사항</h3>
            <p className="text-gray-700">
              개인정보 처리에 관한 문의사항이 있으신 경우 아래로 연락주시기 바랍니다.
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">연락처</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• 이메일: privacy@record.kr</li>
                  <li>• 고객센터: support@record.kr</li>
                  <li>• 운영시간: 평일 09:00 - 18:00</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">관련 기관</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• 개인정보보호위원회: privacy.go.kr (1833-6972)</li>
                  <li>• 개인정보보호 종합지원 포탈: privacy.go.kr</li>
                  <li>• 개인정보 침해신고센터: privacy.or.kr (1833-6972)</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-100 border-l-4 border-gray-400 text-sm text-gray-600">
              <p><strong>전자공시:</strong> 본 개인정보처리방침은 record.kr 웹사이트에 공시하여 언제든지 확인하실 수 있습니다.</p>
              <p className="mt-2"><strong>면책조항:</strong> 본 개인정보처리방침은 정보 제공의 목적으로 작성된 것으로, 개별 상황에 따른 법률 자문은 전문가에게 받으시기 바랍니다.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}