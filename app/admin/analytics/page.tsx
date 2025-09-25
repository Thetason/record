'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

interface Analytics {
  overview: {
    totalUsers: number
    totalReviews: number
    totalRevenue: number
    conversionRate: number
    userGrowth: number
    reviewGrowth: number
    revenueGrowth: number
  }
  userMetrics: {
    date: string
    signups: number
    active: number
    churned: number
  }[]
  reviewMetrics: {
    platform: string
    count: number
    percentage: number
  }[]
  revenueMetrics: {
    date: string
    free: number
    premium: number
    pro: number
  }[]
  conversionFunnel: {
    stage: string
    users: number
    rate: number
  }[]
  topUsers: {
    username: string
    reviews: number
    plan: string
    joinedDaysAgo: number
  }[]
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/analytics?range=${dateRange}`)
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const refreshData = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    setRefreshing(false)
  }

  const COLORS = ['#FF6B35', '#4F46E5', '#10B981', '#F59E0B', '#EF4444']

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">분석 데이터 로딩 중...</div>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">분석 & 인사이트</h1>
            <p className="text-gray-600">실시간 비즈니스 메트릭과 성장 지표</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              리포트 다운로드
            </Button>
          </div>
        </div>

        {/* 날짜 필터 */}
        <div className="flex gap-2 mb-6">
          {['24h', '7d', '30d', '90d'].map(range => (
            <Button
              key={range}
              variant={dateRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {range === '24h' && '24시간'}
              {range === '7d' && '7일'}
              {range === '30d' && '30일'}
              {range === '90d' && '90일'}
            </Button>
          ))}
        </div>

        {/* 핵심 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">총 사용자</span>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatNumber(analytics.overview.totalUsers)}
            </div>
            <div className={`flex items-center text-sm ${
              analytics.overview.userGrowth > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.overview.userGrowth > 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              {Math.abs(analytics.overview.userGrowth)}% vs 이전 기간
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">총 리뷰</span>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatNumber(analytics.overview.totalReviews)}
            </div>
            <div className={`flex items-center text-sm ${
              analytics.overview.reviewGrowth > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.overview.reviewGrowth > 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              {Math.abs(analytics.overview.reviewGrowth)}% vs 이전 기간
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">매출</span>
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(analytics.overview.totalRevenue)}
            </div>
            <div className={`flex items-center text-sm ${
              analytics.overview.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.overview.revenueGrowth > 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              {Math.abs(analytics.overview.revenueGrowth)}% vs 이전 기간
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">전환율</span>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {analytics.overview.conversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">
              무료 → 유료 전환
            </div>
          </Card>
        </div>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 사용자 성장 차트 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">사용자 성장 추이</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.userMetrics}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="signups"
                  stroke="#FF6B35"
                  fillOpacity={1}
                  fill="url(#colorSignups)"
                  name="신규가입"
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="#4F46E5"
                  fillOpacity={1}
                  fill="url(#colorActive)"
                  name="활성사용자"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* 플랫폼별 리뷰 분포 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">플랫폼별 리뷰 분포</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.reviewMetrics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ platform, percentage }) => `${platform} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.reviewMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* 전환 퍼널 & 매출 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 전환 퍼널 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">전환 퍼널</h3>
            <div className="space-y-4">
              {analytics.conversionFunnel.map((stage) => (
                <div key={stage.stage}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <span className="text-sm text-gray-600">
                      {formatNumber(stage.users)} ({stage.rate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${stage.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 플랜별 매출 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">플랜별 매출 추이</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.revenueMetrics}>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="free" stackId="a" fill="#94A3B8" name="무료" />
                <Bar dataKey="premium" stackId="a" fill="#4F46E5" name="프리미엄" />
                <Bar dataKey="pro" stackId="a" fill="#FF6B35" name="프로" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* 상위 사용자 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">상위 활동 사용자</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">사용자</th>
                  <th className="text-left py-2 px-4">리뷰 수</th>
                  <th className="text-left py-2 px-4">플랜</th>
                  <th className="text-left py-2 px-4">가입일</th>
                  <th className="text-left py-2 px-4">일평균</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topUsers.map((user) => (
                  <tr key={user.username} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 font-medium">{user.username}</td>
                    <td className="py-2 px-4">{user.reviews}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                        user.plan === 'premium' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-2 px-4">{user.joinedDaysAgo}일 전</td>
                    <td className="py-2 px-4">
                      {(user.reviews / Math.max(user.joinedDaysAgo, 1)).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
