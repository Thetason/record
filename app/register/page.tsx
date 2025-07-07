'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Container } from '@/components/layout/Container'
import { authApi, profileApi } from '@/lib/api'
import { validateProfileData, validateUsername } from '@/lib/api'
import { ArrowLeft, Mail, Lock, User, AtSign } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Account info, 2: Profile info
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    name: '',
    profession: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [usernameChecking, setUsernameChecking] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      handleStep1Submit()
    } else {
      handleStep2Submit()
    }
  }

  const handleStep1Submit = () => {
    setErrors({})
    const newErrors: Record<string, string> = {}

    // Validation
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다'
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요'
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setStep(2)
  }

  const handleStep2Submit = async () => {
    setLoading(true)
    setErrors({})

    try {
      // Validate profile data
      const profileValidation = validateProfileData({
        username: formData.username,
        name: formData.name,
        profession: formData.profession
      })

      if (Object.keys(profileValidation).length > 0) {
        setErrors(profileValidation)
        setLoading(false)
        return
      }

      // Check username availability
      const usernameResult = await profileApi.isUsernameAvailable(formData.username)
      if (!usernameResult.success || !usernameResult.data) {
        setErrors({ username: '이미 사용 중인 사용자명입니다' })
        setLoading(false)
        return
      }

      // Sign up user
      const result = await authApi.signUp(formData.email, formData.password, {
        username: formData.username,
        name: formData.name,
        profession: formData.profession
      })

      if (result.success) {
        // Show success message and redirect
        router.push('/login?message=회원가입이 완료되었습니다. 로그인해주세요.')
      } else {
        setErrors({ general: result.error || '회원가입에 실패했습니다' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: '예상치 못한 오류가 발생했습니다' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) return

    const usernameError = validateUsername(username)
    if (usernameError) {
      setErrors(prev => ({ ...prev, username: usernameError }))
      return
    }

    setUsernameChecking(true)
    try {
      const result = await profileApi.isUsernameAvailable(username)
      if (!result.success || !result.data) {
        setErrors(prev => ({ ...prev, username: '이미 사용 중인 사용자명입니다' }))
      } else {
        setErrors(prev => ({ ...prev, username: '' }))
      }
    } catch (error) {
      console.error('Username check error:', error)
    } finally {
      setUsernameChecking(false)
    }
  }

  const handleUsernameBlur = () => {
    if (formData.username) {
      checkUsernameAvailability(formData.username)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <Container>
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => step === 1 ? router.back() : setStep(1)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-base"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 1 ? '홈으로 돌아가기' : '이전 단계'}
            </button>
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-lg gradient-primary" />
              <span className="text-lg font-bold gradient-mixed text-gradient">
                Re:cord
              </span>
            </Link>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Container size="sm">
          <div className="max-w-md mx-auto">
            {/* Progress indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
              </div>
            </div>

            <Card className="border-0 shadow-large">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold">
                  {step === 1 ? '계정 만들기' : '프로필 설정'}
                </CardTitle>
                <CardDescription className="text-base">
                  {step === 1 
                    ? 'Re:cord 계정을 만들어 시작하세요' 
                    : '나만의 포트폴리오 URL을 만들어보세요'
                  }
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {errors.general && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                      {errors.general}
                    </div>
                  )}

                  {step === 1 ? (
                    // Step 1: Account Information
                    <>
                      <Input
                        label="이메일"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        leftIcon={<Mail className="h-4 w-4" />}
                        required
                      />

                      <Input
                        label="비밀번호"
                        name="password"
                        type="password"
                        placeholder="최소 6자 이상"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        leftIcon={<Lock className="h-4 w-4" />}
                        helperText="안전한 비밀번호를 사용하세요"
                        required
                      />

                      <Input
                        label="비밀번호 확인"
                        name="confirmPassword"
                        type="password"
                        placeholder="비밀번호를 다시 입력하세요"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        leftIcon={<Lock className="h-4 w-4" />}
                        required
                      />
                    </>
                  ) : (
                    // Step 2: Profile Information
                    <>
                      <Input
                        label="사용자명"
                        name="username"
                        type="text"
                        placeholder="영문, 숫자, 언더스코어, 하이픈만 가능"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={handleUsernameBlur}
                        error={errors.username}
                        leftIcon={<AtSign className="h-4 w-4" />}
                        helperText={`record.kr/${formData.username || '사용자명'} 형태의 URL이 생성됩니다`}
                        required
                      />

                      <Input
                        label="이름"
                        name="name"
                        type="text"
                        placeholder="실제 이름을 입력하세요"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        leftIcon={<User className="h-4 w-4" />}
                        required
                      />

                      <Input
                        label="직업/전문분야"
                        name="profession"
                        type="text"
                        placeholder="예: UI/UX 디자이너, 풀스택 개발자"
                        value={formData.profession}
                        onChange={handleChange}
                        error={errors.profession}
                        helperText="프로필에 표시될 전문분야를 입력하세요"
                      />
                    </>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    loading={loading || usernameChecking}
                    disabled={loading || usernameChecking}
                  >
                    {step === 1 ? '다음 단계' : '계정 만들기'}
                  </Button>

                  {step === 1 && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500">또는</span>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full" 
                        size="lg"
                        type="button"
                        disabled={loading}
                      >
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        구글로 계속하기
                      </Button>
                    </>
                  )}

                  <div className="text-center text-sm text-gray-600">
                    이미 계정이 있으신가요?{' '}
                    <Link 
                      href="/login" 
                      className="text-primary hover:text-primary-600 font-medium transition-base"
                    >
                      로그인
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  )
}