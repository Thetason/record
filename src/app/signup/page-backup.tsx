"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { EyeIcon, EyeOffIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form-simple"

interface SignupForm {
  name: string
  username: string
  email: string
  password: string
  confirmPassword: string
  terms: boolean
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>()

  const watchedUsername = watch("username")
  const watchedPassword = watch("password")

  const onSubmit = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다")
      return
    }

    setIsLoading(true)
    try {
      console.log("Signup data:", data)
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert("회원가입 성공! (임시)")
    } catch (error) {
      console.error("Signup error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[@$!%*?&]/.test(password)) score++
    return score
  }

  const passwordStrength = getPasswordStrength(watchedPassword || "")

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

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">
              회원가입
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              몇 분만에 프로필을 만들고 리뷰를 관리하세요
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormItem>
                <FormLabel htmlFor="name">이름</FormLabel>
                <Input
                  id="name"
                  placeholder="실제 이름을 입력하세요"
                  autoComplete="name"
                  {...register("name", {
                    required: "이름을 입력해주세요",
                    minLength: {
                      value: 2,
                      message: "이름은 최소 2자 이상이어야 합니다"
                    }
                  })}
                />
                {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel htmlFor="username">사용자명</FormLabel>
                <Input
                  id="username"
                  placeholder="프로필 URL에 사용됩니다"
                  autoComplete="username"
                  {...register("username", {
                    required: "사용자명을 입력해주세요",
                    minLength: {
                      value: 3,
                      message: "사용자명은 최소 3자 이상이어야 합니다"
                    },
                    maxLength: {
                      value: 20,
                      message: "사용자명은 최대 20자까지 가능합니다"
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_-]+$/,
                      message: "사용자명은 영문, 숫자, _, - 만 사용 가능합니다"
                    }
                  })}
                />
                {watchedUsername && (
                  <p className="text-[0.8rem] text-gray-600">
                    프로필 URL: re-cord.kr/{watchedUsername}
                  </p>
                )}
                {errors.username && <FormMessage>{errors.username.message}</FormMessage>}
              </FormItem>
              
              <FormItem>
                <FormLabel htmlFor="email">이메일</FormLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  autoComplete="email"
                  {...register("email", {
                    required: "이메일을 입력해주세요",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "올바른 이메일 주소를 입력해주세요"
                    }
                  })}
                />
                {errors.email && <FormMessage>{errors.email.message}</FormMessage>}
              </FormItem>
              
              <FormItem>
                <FormLabel htmlFor="password">비밀번호</FormLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="8자 이상, 대소문자와 숫자 포함"
                    autoComplete="new-password"
                    {...register("password", {
                      required: "비밀번호를 입력해주세요",
                      minLength: {
                        value: 8,
                        message: "비밀번호는 최소 8자 이상이어야 합니다"
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: "비밀번호는 대소문자와 숫자를 포함해야 합니다"
                      }
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {watchedPassword && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i <= passwordStrength
                              ? passwordStrength <= 2
                                ? "bg-red-500"
                                : passwordStrength <= 4
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[0.8rem] text-gray-600">
                      {passwordStrength <= 2 && "약함"}
                      {passwordStrength === 3 && "보통"}
                      {passwordStrength === 4 && "강함"}
                      {passwordStrength === 5 && "매우 강함"}
                    </p>
                  </div>
                )}
                {errors.password && <FormMessage>{errors.password.message}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel htmlFor="confirmPassword">비밀번호 확인</FormLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="비밀번호를 다시 입력하세요"
                    autoComplete="new-password"
                    {...register("confirmPassword", {
                      required: "비밀번호 확인을 입력해주세요"
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && <FormMessage>{errors.confirmPassword.message}</FormMessage>}
              </FormItem>

              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <input
                  type="checkbox"
                  className="mt-1"
                  {...register("terms", {
                    required: "이용약관에 동의해주세요"
                  })}
                />
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    <Link href="/terms" className="text-[#FF6B35] hover:underline">
                      이용약관
                    </Link>
                    과{" "}
                    <Link href="/privacy" className="text-[#FF6B35] hover:underline">
                      개인정보처리방침
                    </Link>
                    에 동의합니다
                  </FormLabel>
                  <p className="text-[0.8rem] text-gray-600">
                    Re:cord의 서비스를 이용하기 위해 필요합니다
                  </p>
                </div>
              </FormItem>
              {errors.terms && <FormMessage>{errors.terms.message}</FormMessage>}

              <Button
                type="submit"
                className="w-full bg-[#FF6B35] hover:bg-[#E55A2B]"
                disabled={isLoading}
              >
                {isLoading ? "계정 생성 중..." : "계정 만들기"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">이미 계정이 있으신가요? </span>
              <Link href="/login" className="text-[#FF6B35] hover:underline font-medium">
                로그인
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}