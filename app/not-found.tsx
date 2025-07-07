import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/layout/Container'
import { Header } from '@/components/layout/Header'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-24">
        <Container>
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">404</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              페이지를 찾을 수 없습니다
            </h1>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
              <br />
              URL을 다시 확인해주세요.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/" className="gap-2">
                  <Home className="h-4 w-4" />
                  홈으로 이동
                </Link>
              </Button>
              
              <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                이전 페이지
              </Button>
            </div>
          </div>
        </Container>
      </main>
    </div>
  )
}