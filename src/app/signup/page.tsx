"use client"

import { useState } from "react"
import Link from "next/link"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다")
      return
    }

    if (!formData.terms) {
      alert("이용약관에 동의해주세요")
      return
    }

    setIsLoading(true)
    try {
      console.log("Signup data:", formData)
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert("회원가입 성공! (임시)")
    } catch (error) {
      console.error("Signup error:", error)
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
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl font-bold">Re:cord</span>
            <span className="text-[#FF6B35] text-3xl">*</span>
          </Link>
          <p className="text-gray-600 mt-2">
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

            <div className="flex items-start space-x-3 rounded-md border p-4">
              <input
                type="checkbox"
                name="terms"
                className="mt-1"
                checked={formData.terms}
                onChange={handleChange}
                required
              />
              <div className="space-y-1 leading-none">
                <label className="text-sm font-normal">
                  <Link href="/terms" className="text-[#FF6B35] hover:underline">
                    이용약관
                  </Link>
                  과{" "}
                  <Link href="/privacy" className="text-[#FF6B35] hover:underline">
                    개인정보처리방침
                  </Link>
                  에 동의합니다
                </label>
                <p className="text-sm text-gray-600">
                  Re:cord의 서비스를 이용하기 위해 필요합니다
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "계정 생성 중..." : "계정 만들기"}
            </button>
          </form>

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