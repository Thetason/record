"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("로그인 중 오류가 발생했습니다.")
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
        <div className="text-center mb-6 md:mb-8">
          <Link href="/" className="inline-flex items-center gap-1 md:gap-2">
            <span className="text-2xl md:text-3xl font-bold">Re:cord</span>
            <span className="text-[#FF6B35] text-2xl md:text-3xl">*</span>
          </Link>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
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

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

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