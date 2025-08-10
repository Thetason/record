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
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({})
  const [allChecked, setAllChecked] = useState(false)

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
      console.log("Signup attempt with:", { email: formData.email, username: formData.username })
      
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
      console.log("Signup response:", data)

      if (!res.ok) {
        throw new Error(data.error || "회원가입 실패")
      }

      // 회원가입 성공 후 자동 로그인
      console.log("Attempting auto-login...")
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      console.log("Login result:", result)

      if (result?.error) {
        console.error("Login error:", result.error)
        // 로그인 실패해도 회원가입은 성공했으므로 로그인 페이지로 이동
        router.push("/login?registered=true")
        return
      }

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Signup error:", error)
      setError(error.message || "회원가입 중 오류가 발생했습니다")
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
    
    // Check if all checkboxes are checked
    if (type === "checkbox") {
      const newFormData = { ...formData, [name]: checked }
      const allConsentsChecked = 
        newFormData.terms && 
        newFormData.truthfulReviews && 
        newFormData.consentResponsibility && 
        newFormData.privacyPolicy
      setAllChecked(allConsentsChecked)
    }
  }

  const toggleAllCheckboxes = () => {
    const newValue = !allChecked
    setFormData(prev => ({
      ...prev,
      terms: newValue,
      truthfulReviews: newValue,
      consentResponsibility: newValue,
      privacyPolicy: newValue
    }))
    setAllChecked(newValue)
  }

  const toggleExpanded = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
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

            {/* 친근한 동의사항 섹션 */}
            <div className="space-y-4">
              {/* 헤더와 전체 동의 */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">리코드 커뮤니티 가입하기</h3>
                  <p className="text-xs text-gray-500 mt-1">신뢰할 수 있는 리뷰 문화를 함께 만들어요</p>
                </div>
                <button
                  type="button"
                  onClick={toggleAllCheckboxes}
                  className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                    allChecked 
                      ? 'bg-[#FF6B35] text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {allChecked ? '✓ 모두 동의함' : '전체 동의'}
                </button>
              </div>
              
              {/* 진실된 리뷰 서약 - 커뮤니티 약속 */}
              <div className="rounded-lg border border-gray-200 hover:border-[#FF6B35] transition-colors p-4 bg-white">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="truthfulReviews"
                    className="w-4 h-4 mt-0.5 text-[#FF6B35] bg-white border-gray-300 rounded focus:ring-[#FF6B35] focus:ring-2"
                    checked={formData.truthfulReviews}
                    onChange={handleChange}
                    required
                  />
                  <div className="flex-1">
                    <label className="flex items-center justify-between cursor-pointer" onClick={() => setFormData(prev => ({...prev, truthfulReviews: !prev.truthfulReviews}))}>
                      <div>
                        <span className="text-sm font-medium text-gray-900">🤝 진실한 리뷰로 함께해요</span>
                        <p className="text-xs text-gray-600 mt-1">
                          내가 직접 경험한 진짜 리뷰만 공유할게요
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpanded('truthful')
                        }}
                        className="text-xs text-gray-500 hover:text-[#FF6B35] ml-2"
                      >
                        {expandedSections.truthful ? '접기' : '자세히'}
                      </button>
                    </label>
                    {expandedSections.truthful && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 leading-relaxed">
                          리코드에서는 실제 경험을 바탕으로 한 진실된 리뷰만 업로드합니다. 
                          허위, 과장, 왜곡된 내용이나 금전적 대가를 받은 리뷰는 업로드하지 않겠습니다.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 책임감 있는 이용 */}
              <div className="rounded-lg border border-gray-200 hover:border-[#FF6B35] transition-colors p-4 bg-white">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="consentResponsibility"
                    className="w-4 h-4 mt-0.5 text-[#FF6B35] bg-white border-gray-300 rounded focus:ring-[#FF6B35] focus:ring-2"
                    checked={formData.consentResponsibility}
                    onChange={handleChange}
                    required
                  />
                  <div className="flex-1">
                    <label className="flex items-center justify-between cursor-pointer" onClick={() => setFormData(prev => ({...prev, consentResponsibility: !prev.consentResponsibility}))}>
                      <div>
                        <span className="text-sm font-medium text-gray-900">⚖️ 책임감 있게 이용할게요</span>
                        <p className="text-xs text-gray-600 mt-1">
                          내 리뷰에 대한 책임은 제가 질게요
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpanded('responsibility')
                        }}
                        className="text-xs text-gray-500 hover:text-[#FF6B35] ml-2"
                      >
                        {expandedSections.responsibility ? '접기' : '자세히'}
                      </button>
                    </label>
                    {expandedSections.responsibility && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 leading-relaxed">
                          허위 리뷰나 타인의 리뷰 무단 도용은 법적 처벌 대상입니다. 
                          리뷰 관련 분쟁 발생 시 리코드는 중개 플랫폼으로서 면책되며, 
                          모든 책임은 작성자가 부담합니다. (형법 제307조, 정보통신망법 제70조, 저작권법 제136조)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 개인정보 처리 */}
              <div className="rounded-lg border border-gray-200 hover:border-[#FF6B35] transition-colors p-4 bg-white">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="privacyPolicy"
                    className="w-4 h-4 mt-0.5 text-[#FF6B35] bg-white border-gray-300 rounded focus:ring-[#FF6B35] focus:ring-2"
                    checked={formData.privacyPolicy}
                    onChange={handleChange}
                    required
                  />
                  <div className="flex-1">
                    <label className="flex items-center justify-between cursor-pointer" onClick={() => setFormData(prev => ({...prev, privacyPolicy: !prev.privacyPolicy}))}>
                      <div>
                        <span className="text-sm font-medium text-gray-900">🔒 개인정보를 안전하게 보호해요</span>
                        <p className="text-xs text-gray-600 mt-1">
                          최소한의 정보만 수집하고 안전하게 관리합니다
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpanded('privacy')
                        }}
                        className="text-xs text-gray-500 hover:text-[#FF6B35] ml-2"
                      >
                        {expandedSections.privacy ? '접기' : '자세히'}
                      </button>
                    </label>
                    {expandedSections.privacy && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 leading-relaxed">
                          서비스 제공을 위한 최소한의 정보(이메일, 이름, 비밀번호)만 수집합니다. 
                          수집된 정보는 회원탈퇴 시까지 안전하게 보관되며, 관련 법령에 따라 철저히 관리됩니다.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 이용약관 */}
              <div className="rounded-lg border border-gray-200 hover:border-[#FF6B35] transition-colors p-4 bg-white">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="terms"
                    className="w-4 h-4 mt-0.5 text-[#FF6B35] bg-white border-gray-300 rounded focus:ring-[#FF6B35] focus:ring-2"
                    checked={formData.terms}
                    onChange={handleChange}
                    required
                  />
                  <div className="flex-1">
                    <label className="flex items-center justify-between cursor-pointer" onClick={() => setFormData(prev => ({...prev, terms: !prev.terms}))}>
                      <div>
                        <span className="text-sm font-medium text-gray-900">📋 리코드 이용약관에 동의해요</span>
                        <p className="text-xs text-gray-600 mt-1">
                          서비스 이용에 필요한 기본 약관입니다
                        </p>
                      </div>
                      <Link 
                        href="/terms" 
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-[#FF6B35] hover:underline ml-2"
                      >
                        약관 보기
                      </Link>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 부드러운 안내 메시지 */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4">
              <p className="text-xs text-gray-700 text-center">
                💡 <strong>리코드는 신뢰를 기반으로 합니다</strong><br/>
                <span className="text-gray-600">
                  진실한 리뷰로 서로의 성장을 돕는 건강한 커뮤니티를 만들어가요
                </span>
              </p>
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