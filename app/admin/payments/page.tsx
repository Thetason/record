'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Search,
  Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Payment {
  id: string
  userId: string
  user: {
    username: string
    email: string
  }
  plan: string
  method: string
  amount: number
  status: string
  orderId: string
  transactionId?: string
  createdAt: string
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    successRate: 0,
    averageAmount: 0
  })

  useEffect(() => {
    fetchPayments()
  }, [filter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/payments?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setPayments(data.payments)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DONE':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            완료
          </span>
        )
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
            <AlertCircle className="w-3 h-3" />
            대기중
          </span>
        )
      case 'FAILED':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            실패
          </span>
        )
      case 'REFUNDED':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            환불됨
          </span>
        )
      default:
        return null
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'pro':
        return (
          <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-medium">
            PRO
          </span>
        )
      case 'premium':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            프리미엄
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {plan}
          </span>
        )
    }
  }

  const filteredPayments = payments.filter(payment => {
    if (searchTerm) {
      return payment.user.username.includes(searchTerm) ||
             payment.user.email.includes(searchTerm) ||
             payment.orderId.includes(searchTerm)
    }
    return true
  })

  const exportToCSV = () => {
    const csv = [
      ['날짜', '사용자', '이메일', '플랜', '금액', '상태', '주문ID'],
      ...filteredPayments.map(p => [
        new Date(p.createdAt).toLocaleDateString('ko-KR'),
        p.user.username,
        p.user.email,
        p.plan,
        p.amount,
        p.status,
        p.orderId
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">결제 데이터 로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">결제 관리</h1>
            <p className="text-gray-600">구독 결제와 환불을 관리합니다</p>
          </div>
          
          <Button onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-1" />
            CSV 다운로드
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 매출</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">이번 달 매출</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.monthlyRevenue)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">성공률</p>
                <p className="text-2xl font-bold">
                  {stats.successRate.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">평균 결제액</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.averageAmount)}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* 필터와 검색 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2 flex-1">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              전체
            </Button>
            <Button
              variant={filter === 'DONE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('DONE')}
            >
              완료
            </Button>
            <Button
              variant={filter === 'PENDING' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('PENDING')}
            >
              대기중
            </Button>
            <Button
              variant={filter === 'FAILED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('FAILED')}
            >
              실패
            </Button>
            <Button
              variant={filter === 'REFUNDED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('REFUNDED')}
            >
              환불
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="사용자명, 이메일, 주문ID 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-80"
            />
          </div>
        </div>

        {/* 결제 목록 테이블 */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">날짜</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">사용자</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">플랜</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">금액</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">방법</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">상태</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">주문ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(payment.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(payment.createdAt), { 
                          addSuffix: true, 
                          locale: ko 
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-sm">{payment.user.username}</div>
                      <div className="text-xs text-gray-500">{payment.user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      {getPlanBadge(payment.plan)}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {payment.method}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs font-mono">{payment.orderId}</div>
                      {payment.transactionId && (
                        <div className="text-xs text-gray-500">TX: {payment.transactionId}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {payment.status === 'DONE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          환불
                        </Button>
                      )}
                      {payment.status === 'FAILED' && (
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          재시도
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredPayments.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </Card>
        )}
      </div>
    </div>
  )
}