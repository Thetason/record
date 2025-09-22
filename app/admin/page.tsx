'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, AlertCircle, TrendingUp, DollarSign, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReviews: 0,
    totalReports: 0,
    monthlyRevenue: 0,
    activeUsers: 0,
    newUsersToday: 0
  })
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminRole, setAdminRole] = useState<'admin' | 'super_admin' | null>(null)

  useEffect(() => {
    // 관리자 권한 체크
    checkAdminAuth()
    // 통계 데이터 로드
    fetchStats()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const res = await fetch('/api/admin/check-auth', { cache: 'no-store' })
      if (!res.ok) {
        router.push('/login')
        return
      }
      const data = await res.json()
      if (data.role !== 'admin' && data.role !== 'super_admin') {
        router.push('/dashboard')
        return
      }
      setIsAdmin(true)
      if (data.role === 'admin' || data.role === 'super_admin') {
        setAdminRole(data.role)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-600 mt-2">Re:cord 서비스 관리 및 모니터링</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">전체 사용자</p>
                <p className="text-2xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-2">+{stats.newUsersToday} 오늘</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">전체 리뷰</p>
                <p className="text-2xl font-bold mt-1">{stats.totalReviews.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">검증률 87%</p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">신고 대기</p>
                <p className="text-2xl font-bold mt-1">{stats.totalReports}</p>
                <p className="text-xs text-orange-600 mt-2">처리 필요</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">월 매출</p>
                <p className="text-2xl font-bold mt-1">₩{stats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-2">+23% 전월 대비</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">활성 사용자</p>
                <p className="text-2xl font-bold mt-1">{stats.activeUsers}</p>
                <p className="text-xs text-gray-500 mt-2">최근 7일</p>
              </div>
              <Activity className="w-8 h-8 text-pink-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">성장률</p>
                <p className="text-2xl font-bold mt-1">+42%</p>
                <p className="text-xs text-gray-500 mt-2">월간 성장</p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-500" />
            </div>
          </Card>
        </div>

        {/* 관리 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/users')}>
            <h3 className="font-semibold text-lg mb-2">사용자 관리</h3>
            <p className="text-gray-600 text-sm">사용자 목록 조회 및 관리</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/reviews')}>
            <h3 className="font-semibold text-lg mb-2">리뷰 관리</h3>
            <p className="text-gray-600 text-sm">리뷰 검증 및 신고 처리</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/payments')}>
            <h3 className="font-semibold text-lg mb-2">결제 관리</h3>
            <p className="text-gray-600 text-sm">구독 및 결제 내역 관리</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/analytics')}>
            <h3 className="font-semibold text-lg mb-2">분석 & 통계</h3>
            <p className="text-gray-600 text-sm">상세 통계 및 인사이트</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/settings')}>
            <h3 className="font-semibold text-lg mb-2">시스템 설정</h3>
            <p className="text-gray-600 text-sm">서비스 설정 및 환경 구성</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/logs')}>
            <h3 className="font-semibold text-lg mb-2">활동 로그</h3>
            <p className="text-gray-600 text-sm">시스템 및 사용자 활동 기록</p>
          </Card>
        </div>

        {/* 빠른 작업 */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">빠른 작업</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/announcements')}>
              공지사항 작성
            </Button>
            <Button variant="outline" size="sm">이메일 발송</Button>
            <Button variant="outline" size="sm">백업 실행</Button>
            <Button variant="outline" size="sm">캐시 정리</Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              유지보수 모드
            </Button>
          </div>
        </div>

        {adminRole === 'super_admin' && (
          <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-3 text-purple-700">슈퍼 관리자 도구</h2>
            <p className="text-sm text-gray-600 mb-4">
              최고 관리자 전용으로 중요한 관리 기능에 빠르게 접근할 수 있습니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-purple-200 text-purple-700 hover:border-purple-300"
                onClick={() => router.push('/admin/users')}
              >
                사용자 권한 관리
              </Button>
              <Button
                variant="outline"
                className="border-purple-200 text-purple-700 hover:border-purple-300"
                onClick={() => router.push('/admin/reviews')}
              >
                리뷰 검토 바로가기
              </Button>
              <Button
                variant="outline"
                className="border-purple-200 text-purple-700 hover:border-purple-300"
                onClick={() => router.push('/admin/announcements')}
              >
                공지사항 관리
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
