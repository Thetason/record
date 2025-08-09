"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
    truthfulReviews: false,
    consentResponsibility: false,
    privacyPolicy: false
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다")
      return
    }

    if (!formData.terms || !formData.truthfulReviews || !formData.consentResponsibility || !formData.privacyPolicy) {
      setError("모든 필수 약관에 동의해주세요")
      return
    }

    setIsLoading(true)
    try {
      // 회원가입 API 호출
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          username: formData.username
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "회원가입 실패")
      }

      // 회원가입 성공 후 자동 로그인
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        throw new Error("로그인 실패")
      }

      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 md:mb-8">
          <Link href="/" className="inline-flex items-center gap-1 md:gap-2">
            <span className="text-2xl md:text-3xl font-bold">Re:cord</span>
            <span className="text-[#FF6B35] text-2xl md:text-3xl">*</span>
          </Link>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            나만의 리뷰 포트폴리오를 시작하세요
          </p>
        </div>

        <div className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-lg p-6">
          <div className="space-y-1 pb-6">
            <h1 className="text-2xl font-semibold text-center">
              회원가입
            </h1>
            <p className="text-center text-gray-600">
              몇 분만에 프로필을 만들고 리뷰를 관리하세요
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">이름</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="실제 이름을 입력하세요"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">사용자명</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="프로필 URL에 사용됩니다"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {formData.username && (
                <p className="text-sm text-gray-600">
                  프로필 URL: re-cord.kr/{formData.username}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="이메일을 입력하세요"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">비밀번호</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8자 이상, 대소문자와 숫자 포함"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">비밀번호 확인</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* 법적 동의사항 섹션 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">필수 동의사항</h3>
              
              {/* 진실된 리뷰 서약 */}
              <div className="flex items-start space-x-3 rounded-md border p-4 bg-yellow-50 border-yellow-200">
                <input
                  type="checkbox"
                  name="truthfulReviews"
                  className="w-4 h-4 mt-1 text-[#FF6B35] bg-white border-gray-300 rounded focus:ring-[#FF6B35] focus:ring-2"
                  checked={formData.truthfulReviews}
                  onChange={handleChange}
                  required
                />
                <div className="space-y-1 leading-none flex-1">
                  <label className="text-sm font-medium text-gray-900 cursor-pointer" onClick={() => setFormData(prev => ({...prev, truthfulReviews: !prev.truthfulReviews}))}>
                    진실된 리뷰 업로드 서약
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    본인은 리코드 플랫폼에 업로드하는 모든 리뷰가 본인이 직접 경험한 사실에 기반한 진실된 내용임을 서약합니다.
                    허위, 과장, 왜곡된 리뷰를 업로드하지 않으며, 금전적 대가를 받고 작성된 리뷰는 업로드하지 않겠습니다.
                  </p>
                </div>
              </div>

              {/* 법적 책임 인정 */}
              <div className="flex items-start space-x-3 rounded-md border p-4 bg-red-50 border-red-200">
                <input
                  type="checkbox"
                  name="consentResponsibility"
                  className="w-4 h-4 mt-1 text-[#FF6B35] bg-white border-gray-300 rounded focus:ring-[#FF6B35] focus:ring-2"
                  checked={formData.consentResponsibility}
                  onChange={handleChange}
                  required
                />
                <div className="space-y-1 leading-none flex-1">
                  <label className="text-sm font-medium text-gray-900 cursor-pointer" onClick={() => setFormData(prev => ({...prev, consentResponsibility: !prev.consentResponsibility}))}>
                    허위 리뷰 및 무단 도용에 대한 법적 책임 인정
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    허위 리뷰 업로드 시 형법 제307조(명예훼손), 정보통신망법 제70조에 따른 법적 처벌을 받을 수 있으며,
                    타인의 리뷰를 무단으로 도용할 경우 저작권법 제136조에 따른 처벌 및 민사상 손해배상 책임이 있음을 인정합니다.
                    리뷰로 인한 모든 법적 분쟁 시 리코드는 면책되며, 본인이 모든 책임을 부담합니다.
                  </p>
                </div>
              </div>

              {/* 개인정보 처리방침 */}
              <div className="flex items-start space-x-3 rounded-md border p-4">
                <input
                  type="checkbox"
                  name="privacyPolicy"
                  className="w-4 h-4 mt-1 text-[#FF6B35] bg-white border-gray-300 rounded focus:ring-[#FF6B35] focus:ring-2"
                  checked={formData.privacyPolicy}
                  onChange={handleChange}
                  required
                />
                <div className="space-y-1 leading-none flex-1">
                  <label className="text-sm font-medium cursor-pointer" onClick={() => setFormData(prev => ({...prev, privacyPolicy: !prev.privacyPolicy}))}>
                    개인정보 수집·이용 동의
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    회원가입 및 서비스 제공을 위한 개인정보(이메일, 이름, 비밀번호) 수집·이용에 동의합니다.
                    개인정보는 회원탈퇴 시까지 보관되며, 관련 법령에 따라 안전하게 관리됩니다.
                  </p>
                </div>
              </div>

              {/* 이용약관 */}
              <div className="flex items-start space-x-3 rounded-md border p-4">
                <input
                  type="checkbox"
                  name="terms"
                  className="w-4 h-4 mt-1 text-[#FF6B35] bg-white border-gray-300 rounded focus:ring-[#FF6B35] focus:ring-2"
                  checked={formData.terms}
                  onChange={handleChange}
                  required
                />
                <div className="space-y-1 leading-none flex-1">
                  <label className="text-sm font-medium cursor-pointer" onClick={() => setFormData(prev => ({...prev, terms: !prev.terms}))}>
                    <Link href="/terms" className="text-[#FF6B35] hover:underline">
                      이용약관
                    </Link>
                    {" 동의"}
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    리코드는 리뷰 공유를 위한 중개 플랫폼이며, 업로드된 리뷰 내용에 대한 책임은 작성자에게 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 중요 안내사항 */}
            <div className="bg-gray-100 rounded-lg p-4 text-xs text-gray-700">
              <p className="font-semibold mb-2">⚠️ 중요 안내사항</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>허위 리뷰 작성 시 최대 5년 이하 징역 또는 5천만원 이하 벌금</li>
                <li>타인의 리뷰 무단 도용 시 저작권법 위반으로 형사처벌 가능</li>
                <li>리뷰로 인한 명예훼손 시 민·형사상 책임 부담</li>
                <li>모든 법적 책임은 리뷰 업로드자에게 있으며, 리코드는 면책됩니다</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "계정 생성 중..." : "계정 만들기"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">이미 계정이 있으신가요? </span>
            <Link href="/login" className="text-[#FF6B35] hover:underline font-medium">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}