import { redirect } from 'next/navigation'

// 판매 상품이 세팅 패키지 하나로 통일되어 업그레이드 화면은 가격 페이지로 합친다.
export default function UpgradePage() {
  redirect('/pricing')
}
