"use client"

import { useState } from "react"
import Link from "next/link"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    try {
      console.log("Login data:", formData)
      
      // 임시 로그인 로직
      if (formData.email === "test@example.com" && formData.password === "password") {
        alert("로그인 성공! 대시보드로 이동합니다.")
        window.location.href = "/dashboard"
      } else {
        alert("이메일 또는 비밀번호가 올바르지 않습니다.\n\n테스트 계정:\n이메일: test@example.com\n비밀번호: password")
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Login error:", error)
      alert("로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl font-bold">Re:cord</span>
            <span className="text-[#FF6B35] text-3xl">*</span>
          </Link>
          <p className="text-gray-600 mt-2">
            리뷰 포트폴리오에 로그인하세요
          </p>
        </div>

        <div className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-lg p-6">
          <div className="space-y-1 pb-6">
            <h1 className="text-2xl font-semibold text-center">
              로그인
            </h1>
            <p className="text-center text-gray-600">
              계정에 로그인하여 리뷰를 관리하세요
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="비밀번호를 입력하세요"
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

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/forgot-password"
                className="text-[#FF6B35] hover:underline"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          {/* 테스트 정보 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">테스트 계정</h3>
            <p className="text-sm text-blue-600">
              이메일: test@example.com<br />
              비밀번호: password
            </p>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">계정이 없으신가요? </span>
            <Link href="/signup" className="text-[#FF6B35] hover:underline font-medium">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}