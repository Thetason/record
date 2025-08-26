'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users,
  UserX,
  Shield,
  AlertTriangle,
  Search,
  Lock,
  Unlock,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface User {
  id: string
  username: string
  email: string
  name: string
  role: string
  plan: string
  createdAt: string
  _count: {
    reviews: number
    sessions: number
  }
  lastLoginAt?: string
  isSuspicious?: boolean
  isBlocked?: boolean
  suspiciousReasons?: string[]
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, suspicious, blocked, premium
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/users?filter=${filter}`)
      if (res.ok) {
        const data = await res.json()
        
        // 의심스러운 사용자 탐지
        const usersWithAnalysis = data.map((user: User) => {
          const suspiciousReasons = []
          
          // 1. 짧은 시간에 너무 많은 리뷰 업로드
          const accountAge = Date.now() - new Date(user.createdAt).getTime()
          const daysOld = accountAge / (1000 * 60 * 60 * 24)
          const reviewsPerDay = user._count.reviews / Math.max(daysOld, 1)
          
          if (reviewsPerDay > 10) {
            suspiciousReasons.push('하루 10개 이상 리뷰 업로드')
          }
          
          // 2. 가입 직후 대량 업로드
          if (daysOld < 1 && user._count.reviews > 20) {
            suspiciousReasons.push('가입 24시간 내 20개 이상 업로드')
          }
          
          // 3. 무료 플랜인데 리뷰 한계 초과
          if (user.plan === 'free' && user._count.reviews > 50) {
            suspiciousReasons.push('무료 플랜 리뷰 한계 초과')
          }
          
          // 4. 이메일 패턴 체크 (임시 이메일)
          const tempEmailDomains = ['tempmail', 'guerrillamail', '10minutemail', 'mailinator']
          if (tempEmailDomains.some(domain => user.email.includes(domain))) {
            suspiciousReasons.push('임시 이메일 사용')
          }
          
          return {
            ...user,
            isSuspicious: suspiciousReasons.length > 0,
            suspiciousReasons
          }
        })
        
        setUsers(usersWithAnalysis)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, action: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (res.ok) {
        fetchUsers()
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    if (searchTerm) {
      return user.username.includes(searchTerm) || 
             user.email.includes(searchTerm) ||
             user.name.includes(searchTerm)
    }
    
    if (filter === 'suspicious') return user.isSuspicious
    if (filter === 'blocked') return user.isBlocked
    if (filter === 'premium') return user.plan !== 'free'
    
    return true
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            관리자
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            일반
          </span>
        )
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
            무료
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">사용자 데이터 로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">사용자 관리</h1>
          <p className="text-gray-600">스팸 사용자를 탐지하고 계정을 관리합니다</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">전체 사용자</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">의심 계정</p>
                <p className="text-2xl font-bold text-orange-600">
                  {users.filter(u => u.isSuspicious).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">차단됨</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.isBlocked).length}
                </p>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">유료 사용자</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.plan !== 'free').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
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
              variant={filter === 'suspicious' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('suspicious')}
            >
              의심 계정
            </Button>
            <Button
              variant={filter === 'blocked' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('blocked')}
            >
              차단됨
            </Button>
            <Button
              variant={filter === 'premium' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('premium')}
            >
              유료
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="사용자명, 이메일 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-80"
            />
          </div>
        </div>

        {/* 사용자 목록 */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card 
              key={user.id} 
              className={`p-6 hover:shadow-lg transition-shadow ${
                user.isBlocked ? 'opacity-60' : ''
              } ${
                user.isSuspicious ? 'border-orange-300' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {user.isSuspicious && (
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    )}
                    {user.isBlocked && (
                      <Ban className="w-5 h-5 text-red-500" />
                    )}
                    <h3 className="font-semibold text-lg">{user.username}</h3>
                    {getRoleBadge(user.role)}
                    {getPlanBadge(user.plan)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="block text-xs text-gray-400">이메일</span>
                      {user.email}
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400">리뷰 수</span>
                      {user._count.reviews}개
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400">가입일</span>
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: ko })}
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400">마지막 로그인</span>
                      {user.lastLoginAt ? 
                        formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true, locale: ko }) : 
                        '기록 없음'
                      }
                    </div>
                  </div>
                  
                  {user.isSuspicious && user.suspiciousReasons && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-orange-700 mb-1">의심 사유:</p>
                      <ul className="text-xs text-orange-600 space-y-1">
                        {user.suspiciousReasons.map((reason, idx) => (
                          <li key={idx}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    상세보기
                  </Button>
                  
                  {!user.isBlocked ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => updateUserStatus(user.id, 'block')}
                    >
                      <Lock className="w-4 h-4 mr-1" />
                      차단
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700"
                      onClick={() => updateUserStatus(user.id, 'unblock')}
                    >
                      <Unlock className="w-4 h-4 mr-1" />
                      차단 해제
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </Card>
        )}
      </div>

      {/* 상세보기 모달 */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">사용자 상세 정보</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedUser(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">사용자명</span>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">이메일</span>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">이름</span>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">플랜</span>
                  <p className="font-medium">{selectedUser.plan}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">리뷰 수</span>
                  <p className="font-medium">{selectedUser._count.reviews}개</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">로그인 횟수</span>
                  <p className="font-medium">{selectedUser._count.sessions}회</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">가입일</span>
                  <p className="font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">계정 상태</span>
                  <p className="font-medium">
                    {selectedUser.isBlocked ? '차단됨' : '활성'}
                  </p>
                </div>
              </div>
              
              {selectedUser.isSuspicious && selectedUser.suspiciousReasons && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="font-medium text-orange-700 mb-2">⚠️ 의심 사유</p>
                  <ul className="text-sm text-orange-600 space-y-1">
                    {selectedUser.suspiciousReasons.map((reason, idx) => (
                      <li key={idx}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="pt-4 border-t flex gap-2">
                {!selectedUser.isBlocked ? (
                  <>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => updateUserStatus(selectedUser.id, 'block')}
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      계정 차단
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => updateUserStatus(selectedUser.id, 'reset-password')}
                    >
                      비밀번호 초기화
                    </Button>
                  </>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => updateUserStatus(selectedUser.id, 'unblock')}
                  >
                    <Unlock className="w-4 h-4 mr-1" />
                    차단 해제
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}