"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeftIcon, EnvelopeClosedIcon, CheckCircledIcon } from "@radix-ui/react-icons"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "비밀번호 재설정 실패")
      }

      setIsSuccess(true)
    } catch (error) {
      console.error("Forgot password error:", error)
      const message = error instanceof Error ? error.message : "비밀번호 재설정 중 오류가 발생했습니다"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <CheckCircledIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">이메일을 확인해주세요</h2>
            <p className="text-gray-600 mb-6">
              비밀번호 재설정 링크를 {email}로 전송했습니다.
              <br />
              이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsSuccess(false)
                  setEmail("")
                }}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                다른 이메일로 재시도
              </button>
              <Link
                href="/login"
                className="w-full block py-3 px-4 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E55A2B] transition-colors text-center"
              >
                로그인 페이지로
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          {/* Back Button */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>로그인으로 돌아가기</span>
          </Link>

          <div className="space-y-1 pb-6">
            <h1 className="text-2xl font-semibold">비밀번호 찾기</h1>
            <p className="text-gray-600">
              가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                이메일 주소
              </label>
              <div className="relative">
                <EnvelopeClosedIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="가입하신 이메일을 입력하세요"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={isLoading || !email}
            >
              {isLoading ? "전송 중..." : "재설정 링크 보내기"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              비밀번호가 기억나셨나요?{" "}
              <Link href="/login" className="text-[#FF6B35] hover:underline font-medium">
                로그인
              </Link>
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            도움이 필요하신가요?{" "}
            <a href="mailto:support@record.com" className="text-[#FF6B35] hover:underline">
              support@record.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
