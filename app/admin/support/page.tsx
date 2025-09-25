'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  User,
  Send,
  Search,
  ArrowUp,
  Paperclip
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Ticket {
  id: string
  userEmail: string
  userName?: string
  category: string
  priority: string
  status: string
  subject: string
  description: string
  messages: TicketMessage[]
  createdAt: string
  updatedAt: string
}

interface TicketMessage {
  id: string
  authorName: string
  authorRole: string
  content: string
  createdAt: string
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('open')
  const [searchTerm, setSearchTerm] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [sending, setSending] = useState(false)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/tickets?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setTickets(data)
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const sendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return

    setSending(true)
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyMessage })
      })

      if (res.ok) {
        setReplyMessage('')
        // 티켓 새로고침
        const ticketRes = await fetch(`/api/admin/tickets/${selectedTicket.id}`)
        if (ticketRes.ok) {
          const updatedTicket = await ticketRes.json()
          setSelectedTicket(updatedTicket)
          // 목록에서도 업데이트
          setTickets(tickets.map(t => 
            t.id === updatedTicket.id ? updatedTicket : t
          ))
        }
      }
    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      setSending(false)
    }
  }

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        fetchTickets()
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status })
        }
      }
    } catch (error) {
      console.error('Failed to update ticket:', error)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      bug: 'bg-red-100 text-red-700',
      feature: 'bg-blue-100 text-blue-700',
      payment: 'bg-green-100 text-green-700',
      account: 'bg-purple-100 text-purple-700',
      review: 'bg-yellow-100 text-yellow-700',
      other: 'bg-gray-100 text-gray-700'
    }
    return colors[category] || colors.other
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'text-red-600 font-bold',
      high: 'text-orange-600',
      normal: 'text-gray-600',
      low: 'text-gray-400'
    }
    return colors[priority] || colors.normal
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-500" />
      default:
        return null
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    if (searchTerm) {
      return ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
             ticket.userEmail.includes(searchTerm) ||
             ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">티켓 로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">고객 지원</h1>
          <p className="text-gray-600">고객 문의를 관리하고 응답합니다</p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">열린 티켓</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">진행 중</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tickets.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">해결됨</p>
                <p className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">긴급</p>
                <p className="text-2xl font-bold text-red-600">
                  {tickets.filter(t => t.priority === 'urgent').length}
                </p>
              </div>
              <ArrowUp className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 티켓 목록 */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {['open', 'in_progress', 'resolved', 'closed'].map(status => (
                  <Button
                    key={status}
                    variant={filter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(status)}
                  >
                    {status === 'open' && '열림'}
                    {status === 'in_progress' && '진행중'}
                    {status === 'resolved' && '해결'}
                    {status === 'closed' && '닫힘'}
                  </Button>
                ))}
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50'
                    } ${
                      ticket.priority === 'urgent' ? 'border-red-300' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(ticket.category)}`}>
                          {ticket.category}
                        </span>
                      </div>
                      <span className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority === 'urgent' && '🔥'}
                        {ticket.priority}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-sm mb-1 line-clamp-1">
                      {ticket.subject}
                    </h3>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{ticket.userName || ticket.userEmail.split('@')[0]}</span>
                      <span>
                        {formatDistanceToNow(new Date(ticket.createdAt), { 
                          addSuffix: true, 
                          locale: ko 
                        })}
                      </span>
                    </div>
                    
                    {ticket.messages.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        <MessageSquare className="w-3 h-3" />
                        {ticket.messages.length}개 메시지
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 티켓 상세 */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card className="p-6">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                    <div className="flex gap-2">
                      {selectedTicket.status !== 'closed' && (
                        <>
                          {selectedTicket.status === 'open' && (
                            <Button
                              size="sm"
                              onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                            >
                              진행 시작
                            </Button>
                          )}
                          {selectedTicket.status === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                            >
                              해결 완료
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-gray-600"
                            onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                          >
                            닫기
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{selectedTicket.userName || selectedTicket.userEmail}</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(selectedTicket.category)}`}>
                      {selectedTicket.category}
                    </span>
                    <span>•</span>
                    <span className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>

                {/* 메시지 목록 */}
                <div className="border-t pt-4 mb-4 max-h-[400px] overflow-y-auto">
                  <div className="space-y-4">
                    {/* 초기 메시지 */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {selectedTicket.userName || selectedTicket.userEmail}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(selectedTicket.createdAt), { 
                              addSuffix: true, 
                              locale: ko 
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedTicket.description}
                        </p>
                      </div>
                    </div>

                    {/* 대화 메시지 */}
                    {selectedTicket.messages.map(message => (
                      <div key={message.id} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.authorRole === 'admin' 
                            ? 'bg-blue-100' 
                            : message.authorRole === 'system'
                            ? 'bg-gray-100'
                            : 'bg-green-100'
                        }`}>
                          {message.authorRole === 'admin' && '👨‍💼'}
                          {message.authorRole === 'system' && '🤖'}
                          {message.authorRole === 'user' && '👤'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {message.authorName}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              message.authorRole === 'admin' 
                                ? 'bg-blue-100 text-blue-700' 
                                : message.authorRole === 'system'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {message.authorRole === 'admin' && '관리자'}
                              {message.authorRole === 'system' && '시스템'}
                              {message.authorRole === 'user' && '고객'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(message.createdAt), { 
                                addSuffix: true, 
                                locale: ko 
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 답변 입력 */}
                {selectedTicket.status !== 'closed' && (
                  <div className="border-t pt-4">
                    <Textarea
                      placeholder="답변을 입력하세요..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="mb-2"
                      rows={3}
                    />
                    <div className="flex justify-between items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                      >
                        <Paperclip className="w-4 h-4 mr-1" />
                        파일 첨부
                      </Button>
                      <Button
                        onClick={sendReply}
                        disabled={!replyMessage.trim() || sending}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        {sending ? '전송 중...' : '답변 보내기'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-12 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>티켓을 선택하세요</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
