'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Megaphone,
  Plus,
  Edit,
  Trash,
  Eye,
  EyeOff,
  Pin,
  Calendar,
  Users
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  target: string
  isActive: boolean
  isPinned: boolean
  startDate?: string
  endDate?: string
  viewCount: number
  createdAt: string
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    target: 'all',
    isPinned: false,
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/announcements')
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data)
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId 
        ? `/api/admin/announcements/${editingId}`
        : '/api/admin/announcements'
      
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchAnnouncements()
        setShowForm(false)
        setEditingId(null)
        setFormData({
          title: '',
          content: '',
          type: 'info',
          target: 'all',
          isPinned: false,
          startDate: '',
          endDate: ''
        })
      }
    } catch (error) {
      console.error('Failed to save announcement:', error)
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (res.ok) {
        fetchAnnouncements()
      }
    } catch (error) {
      console.error('Failed to toggle announcement:', error)
    }
  }

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchAnnouncements()
      }
    } catch (error) {
      console.error('Failed to delete announcement:', error)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'success':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'error':
        return 'bg-red-100 text-red-700 border-red-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getTargetLabel = (target: string) => {
    switch (target) {
      case 'all':
        return '전체'
      case 'free':
        return '무료 사용자'
      case 'premium':
        return '프리미엄'
      case 'pro':
        return '프로'
      default:
        return target
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">공지사항 로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">공지사항 관리</h1>
            <p className="text-gray-600">서비스 공지사항과 업데이트를 관리합니다</p>
          </div>
          
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-1" />
            새 공지사항
          </Button>
        </div>

        {/* 공지사항 작성 폼 */}
        {showForm && (
          <Card className="p-6 mb-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">제목</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">유형</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="info">정보</option>
                      <option value="warning">경고</option>
                      <option value="success">성공</option>
                      <option value="error">오류</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">대상</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={formData.target}
                      onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    >
                      <option value="all">전체</option>
                      <option value="free">무료 사용자</option>
                      <option value="premium">프리미엄</option>
                      <option value="pro">프로</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">내용</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">시작일 (선택)</label>
                  <Input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">종료일 (선택)</label>
                  <Input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">상단 고정</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                  }}
                >
                  취소
                </Button>
                <Button type="submit">
                  {editingId ? '수정' : '작성'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* 공지사항 목록 */}
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`p-6 ${!announcement.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  {announcement.isPinned && (
                    <Pin className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        getTypeColor(announcement.type)
                      }`}>
                        {announcement.type}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {getTargetLabel(announcement.target)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {announcement.viewCount} 조회
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(announcement.createdAt), { 
                          addSuffix: true, 
                          locale: ko 
                        })}
                      </span>
                      {announcement.startDate && (
                        <span>
                          시작: {new Date(announcement.startDate).toLocaleDateString('ko-KR')}
                        </span>
                      )}
                      {announcement.endDate && (
                        <span>
                          종료: {new Date(announcement.endDate).toLocaleDateString('ko-KR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(announcement.id, announcement.isActive)}
                  >
                    {announcement.isActive ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        숨김
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        표시
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        title: announcement.title,
                        content: announcement.content,
                        type: announcement.type,
                        target: announcement.target,
                        isPinned: announcement.isPinned,
                        startDate: announcement.startDate || '',
                        endDate: announcement.endDate || ''
                      })
                      setEditingId(announcement.id)
                      setShowForm(true)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => deleteAnnouncement(announcement.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {announcements.length === 0 && (
          <Card className="p-12 text-center">
            <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">공지사항이 없습니다</p>
          </Card>
        )}
      </div>
    </div>
  )
}