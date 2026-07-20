"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getProviders, signIn, type ClientSafeProvider } from "next-auth/react"
import Link from "next/link"

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_missing_email: '소셜 계정에서 이메일 정보를 전달받지 못했습니다. 카카오 계정에서 이메일 제공에 동의한 뒤 다시 시도해주세요.',
  OAuthAccountNotLinked: '이미 다른 로그인 방식으로 가입된 계정입니다. 기존 로그인 수단을 사용하거나 비밀번호 재설정을 진행해주세요.',
  Configuration: '소셜 로그인 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.',
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white/80 p-6 text-center text-sm text-gray-600 shadow-xl backdrop-blur-sm">
        로그인 화면을 불러오는 중입니다.
      </div>
    </div>
  )
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthInFlight, setOauthInFlight] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [providersLoaded, setProvidersLoaded] = useState(false)
  const [providerMap, setProviderMap] = useState<Record<string, ClientSafeProvider>>({})

  useEffect(() => {
    let active = true
    getProviders()
      .then((providers) => {
        if (!active) return
        setProviderMap(providers ?? {})
        setProvidersLoaded(true)
      })
      .catch((err) => {
        console.error('Failed to load auth providers:', err)
        setProvidersLoaded(true)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!searchParams) return

    const registered = searchParams.get('registered')
    setInfo(registered === 'true' ? '회원가입이 완료되었습니다. 가입한 계정으로 로그인해주세요.' : '')

    const errorCode = searchParams.get('error')
    if (errorCode) {
      const mapped = OAUTH_ERROR_MESSAGES[errorCode] || '로그인 중 문제가 발생했습니다. 다시 시도해주세요.'
      setError(mapped)
    }
  }, [searchParams])

  const hasGoogle = Boolean(providerMap.google && providerMap.google.type === 'oauth')
  const hasKakao = Boolean(providerMap.kakao && providerMap.kakao.type === 'oauth')
  const disableActions = isLoading || oauthInFlight

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')

    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.')
      } else if (result?.ok) {
        router.push('/dashboard')
      } else {
        setError('로그인 중 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOAuthSignIn = async (provider: 'google' | 'kakao') => {
    setError('')
    setInfo('')
    setOauthInFlight(true)
    try {
      const response = await signIn(provider, { callbackUrl: '/dashboard' })
      if (response?.error) {
        const mapped = OAUTH_ERROR_MESSAGES[response.error] || '소셜 로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        setError(mapped)
        setOauthInFlight(false)
      }
    } catch (err) {
      console.error(`${provider} sign-in error:`, err)
      setError('소셜 로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setOauthInFlight(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-4 md:mb-6">
          <Link href="/" className="inline-flex items-center gap-1 md:gap-2">
            <span className="text-xl sm:text-2xl md:text-3xl font-bold">Re:cord</span>
            <span className="text-[#FF6B35] text-xl sm:text-2xl md:text-3xl">*</span>
          </Link>
          <p className="text-gray-600 mt-2 text-sm md:text-base">내 신뢰 페이지에 로그인하세요</p>
        </div>

        <div className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-lg p-5 sm:p-6">
          <div className="space-y-1 pb-4 md:pb-6 text-center">
            <h1 className="text-xl sm:text-2xl font-semibold">로그인</h1>
            <p className="text-sm sm:text-base text-gray-600">계정에 로그인하여 후기 자산과 공개 페이지를 관리하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">아이디</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="아이디를 입력하세요"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
                disabled={disableActions}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">비밀번호</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  disabled={disableActions}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={disableActions}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link href="/forgot-password" className="text-[#FF6B35] hover:underline">
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={disableActions}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {(error || info) && (
            <div
              className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                error ? 'border-red-200 bg-red-50 text-red-600' : 'border-blue-200 bg-blue-50 text-blue-700'
              }`}
            >
              {error || info}
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <div className="space-y-3">
            {providersLoaded && !hasGoogle && !hasKakao && (
              <p className="text-center text-sm text-gray-500">
                소셜 로그인 설정이 아직 완료되지 않았습니다. 관리자에게 문의해주세요.
              </p>
            )}

            {hasGoogle && (
              <button
                onClick={() => handleOAuthSignIn('google')}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                disabled={disableActions}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                구글로 계속하기
              </button>
            )}

            {/* 카카오 로그인 임시 비활성화 */}
            {false && hasKakao && (
              <button
                onClick={() => handleOAuthSignIn('kakao')}
                className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#FADA0A] text-[#191919] py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                disabled={disableActions}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#191919" d="M12 3c-4.97 0-9 3.03-9 6.75 0 2.43 1.71 4.56 4.29 5.75-.15.51-.89 3.03-.91 3.14 0 0-.02.17.09.24.11.07.24.01.24.01 1.19-.17 4.84-3.18 5.61-3.72.23.02.45.03.68.03 4.97 0 9-3.03 9-6.75S16.97 3 12 3z" />
                </svg>
                카카오로 계속하기
              </button>
            )}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageContent />
    </Suspense>
  )
}
