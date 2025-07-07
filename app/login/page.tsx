'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Container } from '@/components/layout/Container'
import { authApi } from '@/lib/api'
import { ArrowLeft, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Basic validation
      const newErrors: Record<string, string> = {}
      if (!formData.email) {
        newErrors.email = '이메일을 입력해주세요'
      }
      if (!formData.password) {
        newErrors.password = '비밀번호를 입력해주세요'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setLoading(false)
        return
      }

      const result = await authApi.signIn(formData.email, formData.password)

      if (result.success) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setErrors({ general: result.error || '로그인에 실패했습니다' })
      }
    } catch (error) {
      console.error('Login error:', error)
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <Container>
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-base">
              <ArrowLeft className="h-4 w-4" />
              홈으로 돌아가기
            </Link>
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
            <Card className="border-0 shadow-large">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold">로그인</CardTitle>
                <CardDescription className="text-base">
                  Re:cord 계정으로 로그인하세요
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {errors.general && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                      {errors.general}
                    </div>
                  )}

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
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    leftIcon={<Lock className="h-4 w-4" />}
                    required
                  />

                  <div className="text-right">
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-primary hover:text-primary-600 transition-base"
                    >
                      비밀번호를 잊으셨나요?
                    </Link>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    loading={loading}
                    disabled={loading}
                  >
                    로그인
                  </Button>

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
                    구글로 로그인
                  </Button>

                  <div className="text-center text-sm text-gray-600">
                    아직 계정이 없으신가요?{' '}
                    <Link 
                      href="/register" 
                      className="text-primary hover:text-primary-600 font-medium transition-base"
                    >
                      회원가입
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