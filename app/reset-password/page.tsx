"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { LockClosedIcon, CheckCircledIcon } from "@radix-ui/react-icons"
import bcryptjs from "bcryptjs"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("유효하지 않은 재설정 링크입니다.")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    // 비밀번호 강도 체크
    if (password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token,
          password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "비밀번호 재설정 실패")
      }

      setIsSuccess(true)
    } catch (error: any) {
      console.error("Reset password error:", error)
      setError(error.message || "비밀번호 재설정 중 오류가 발생했습니다")
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
            <h2 className="text-2xl font-bold mb-2">비밀번호가 재설정되었습니다</h2>
            <p className="text-gray-600 mb-6">
              새로운 비밀번호로 로그인하실 수 있습니다.
            </p>
            <Link
              href="/login"
              className="w-full block py-3 px-4 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E55A2B] transition-colors text-center"
            >
              로그인하러 가기
            </Link>
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
          <div className="space-y-1 pb-6">
            <h1 className="text-2xl font-semibold">새 비밀번호 설정</h1>
            <p className="text-gray-600">
              안전한 새 비밀번호를 입력해주세요.
            </p>
          </div>

          {!token ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              <p className="font-medium mb-2">유효하지 않은 링크</p>
              <p className="text-sm mb-4">
                비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.
              </p>
              <Link
                href="/forgot-password"
                className="text-sm text-[#FF6B35] hover:underline font-medium"
              >
                다시 요청하기 →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  새 비밀번호
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="새 비밀번호 입력 (최소 8자)"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
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
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호 다시 입력"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* 비밀번호 강도 표시 */}
              {password && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">비밀번호 강도</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                        ✓ 8자 이상
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                        ✓ 대문자 포함
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                        ✓ 숫자 포함
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${/[!@#$%^&*]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                        ✓ 특수문자 포함
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                disabled={isLoading || !password || !confirmPassword}
              >
                {isLoading ? "재설정 중..." : "비밀번호 재설정"}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              도움이 필요하신가요?{" "}
              <a href="mailto:support@record.com" className="text-[#FF6B35] hover:underline">
                support@record.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}