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
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({})
  const [allChecked, setAllChecked] = useState(false)

  // Validation helper functions
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!email) return "이메일을 입력해주세요"
    if (!emailRegex.test(email)) return "올바른 이메일 주소를 입력해주세요"
    if (email.length > 254) return "이메일 주소가 너무 깁니다"
    return null
  }

  const validatePassword = (password: string): string | null => {
    if (!password) return "비밀번호를 입력해주세요"
    if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다"
    if (!/(?=.*[a-z])/.test(password)) return "비밀번호에 소문자를 포함해주세요"
    if (!/(?=.*[A-Z])/.test(password)) return "비밀번호에 대문자를 포함해주세요"
    if (!/(?=.*\d)/.test(password)) return "비밀번호에 숫자를 포함해주세요"
    if (password.length > 128) return "비밀번호가 너무 깁니다"
    return null
  }

  const validateUsername = (username: string): string | null => {
    if (!username) return "사용자명을 입력해주세요"
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    const reservedWords = ['admin', 'root', 'api', 'www', 'mail', 'ftp', 'admin', 'test', 'guest', 'user', 'null', 'undefined']
    
    if (!usernameRegex.test(username)) {
      if (username.length < 3) return "사용자명은 3자 이상이어야 합니다"
      if (username.length > 20) return "사용자명은 20자 이하여야 합니다"
      return "사용자명에는 영문자, 숫자, 밑줄(_), 하이픈(-)만 사용 가능합니다"
    }
    
    if (reservedWords.includes(username.toLowerCase())) {
      return "이 사용자명은 사용할 수 없습니다"
    }
    
    return null
  }

  const validateName = (name: string): string | null => {
    if (!name || !name.trim()) return "이름을 입력해주세요"
    if (name.trim().length > 50) return "이름이 너무 깁니다"
    return null
  }

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {}
    
    const nameError = validateName(formData.name)
    if (nameError) errors.name = nameError
    
    const usernameError = validateUsername(formData.username)
    if (usernameError) errors.username = usernameError
    
    const emailError = validateEmail(formData.email)
    if (emailError) errors.email = emailError
    
    const passwordError = validatePassword(formData.password)
    if (passwordError) errors.password = passwordError
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "비밀번호가 일치하지 않습니다"
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setFieldErrors({})
    
    // 클라이언트 사이드 validation
    if (!validateForm()) {
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
    } catch (error) {
      console.error("Signup error:", error)
      const message = error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다"
      setError(message)
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
    
    // Clear field error when user starts typing
    if (type !== "checkbox" && fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    // Clear confirm password error when password changes
    if (name === "password" && fieldErrors.confirmPassword) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.confirmPassword
        return newErrors
      })
    }
    
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

          {/* 소셜 로그인 버튼 */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              구글로 시작하기
            </button>

            <button
              type="button"
              onClick={() => signIn('kakao', { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#FADA0A] text-[#191919] py-3 px-4 rounded-lg font-medium transition-colors"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#191919" d="M12 3c-4.97 0-9 3.03-9 6.75 0 2.43 1.71 4.56 4.29 5.75-.15.51-.89 3.03-.91 3.14 0 0-.02.17.09.24.11.07.24.01.24.01 1.19-.17 4.84-3.18 5.61-3.72.23.02.45.03.68.03 4.97 0 9-3.03 9-6.75S16.97 3 12 3z"/>
              </svg>
              카카오로 시작하기
            </button>
          </div>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는 이메일로 가입</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">이름</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="실제 이름을 입력하세요"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.name 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-[#FF6B35] focus:border-[#FF6B35]'
                }`}
                value={formData.name}
                onChange={handleChange}
                required
              />
              {fieldErrors.name && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">사용자명</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="3-20자, 영문자/숫자/밑줄/하이픈만 사용"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.username 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-[#FF6B35] focus:border-[#FF6B35]'
                }`}
                value={formData.username}
                onChange={handleChange}
                required
              />
              {fieldErrors.username && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.username}</p>
              )}
              {formData.username && !fieldErrors.username && (
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
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.email 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-[#FF6B35] focus:border-[#FF6B35]'
                }`}
                value={formData.email}
                onChange={handleChange}
                required
              />
              {fieldErrors.email && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">비밀번호</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8자 이상, 대소문자와 숫자 포함"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                    fieldErrors.password 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-[#FF6B35] focus:border-[#FF6B35]'
                  }`}
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
              {fieldErrors.password && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">비밀번호 확인</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력하세요"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                    fieldErrors.confirmPassword 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-[#FF6B35] focus:border-[#FF6B35]'
                  }`}
                  value={formData.confirmPassword}
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
              {fieldErrors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.confirmPassword}</p>
              )}
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
