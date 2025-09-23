"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  UploadIcon,
  ImageIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ReloadIcon
} from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface OCRResult {
  id: string
  fileName: string
  status: 'pending' | 'processing' | 'success' | 'error'
  progress: number
  text?: string
  parsed?: any
  error?: string
  confidence?: number
  previewUrl?: string
  saved?: boolean
  order: number
}

type ReviewFormState = {
  platform: string
  rating: number
  business: string
  author: string
  reviewDate: string
  content: string
  link: string
}

interface BulkUploadResult {
  success: boolean
  message?: string
  total?: number
  created?: number
  skipped?: number
  errors?: string[]
  validationErrors?: number
  processingErrors?: number
  summary?: {
    totalProcessed: number
    validReviews: number
    successfullyCreated: number
    duplicatesSkipped: number
    validationErrors: number
    processingErrors: number
  }
}

export default function BulkUploadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<File[]>([])
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(0)
  const [selectedTab, setSelectedTab] = useState<'image' | 'paste'>('image')
  const [activeResultId, setActiveResultId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Record<string, ReviewFormState>>({})

  const updateResult = (id: string, updater: Partial<OCRResult> | ((result: OCRResult) => Partial<OCRResult>)) => {
    setOcrResults(prev => prev.map(result => {
      if (result.id !== id) {
        return result
      }
      const patch = typeof updater === 'function' ? updater(result) : updater
      return { ...result, ...patch }
    }))
  }

  // 이미지 파일 선택 처리
  const initializeImageFiles = (imageFiles: File[]) => {
    // 기존 미리보기 URL 정리
    ocrResults.forEach(result => {
      if (result.previewUrl) {
        URL.revokeObjectURL(result.previewUrl)
      }
    })

    setFiles(imageFiles)

    const now = new Date()
    const defaultDate = now.toISOString().slice(0, 10)

    const initialResults: OCRResult[] = imageFiles.map((file, idx) => {
      const previewUrl = URL.createObjectURL(file)
      const id = Math.random().toString(36).substr(2, 9)
      return {
        id,
        fileName: file.name,
        status: 'pending',
        progress: 0,
        previewUrl,
        order: idx + 1,
      }
    })

    const initialEditing: Record<string, ReviewFormState> = {}
    initialResults.forEach(result => {
      initialEditing[result.id] = {
        platform: '네이버',
        rating: 5,
        business: '',
        author: '익명',
        reviewDate: defaultDate,
        content: '',
        link: '',
      }
    })

    setOcrResults(initialResults)
    setEditingData(initialEditing)
    setActiveResultId(initialResults[0]?.id ?? null)
  }

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target?.files || [])
    const imageFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/')
    )

    if (imageFiles.length !== selectedFiles.length) {
      toast({
        title: "일부 파일이 제외되었습니다",
        description: "이미지 파일만 업로드 가능합니다",
        variant: "default"
      })
    }

    initializeImageFiles(imageFiles)
  }

  // 드래그 앤 드롭 처리
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length !== droppedFiles.length) {
      toast({
        title: "일부 파일이 제외되었습니다",
        description: "이미지 파일만 업로드 가능합니다",
        variant: "default"
      })
    }
    initializeImageFiles(imageFiles)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Google Vision API를 사용한 OCR
  const performOCR = async (file: File, resultId: string) => {
    let progressInterval: NodeJS.Timeout | null = null
    try {
      updateResult(resultId, { status: 'processing', progress: 10 })

      let current = 10
      progressInterval = setInterval(() => {
        current = Math.min(current + 8, 85)
        updateResult(resultId, { progress: current })
      }, 350)

      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        if (progressInterval) clearInterval(progressInterval)
        updateResult(resultId, {
          status: 'success',
          progress: 100,
          text: data.text,
          parsed: data.parsed,
          confidence: data.confidence,
        })

        setEditingData(prev => {
          const existing = prev[resultId]
          const parsed = data.parsed || {}
          const defaultDate = existing?.reviewDate || new Date().toISOString().slice(0, 10)
          return {
            ...prev,
            [resultId]: {
              platform: parsed.platform || existing?.platform || '네이버',
              rating: parsed.rating || existing?.rating || 5,
              business: parsed.business || existing?.business || '',
              author: parsed.author || existing?.author || '익명',
              reviewDate: (parsed.reviewDate && parsed.reviewDate.slice(0, 10)) || defaultDate,
              content: data.text || existing?.content || '',
              link: parsed.link || existing?.link || '',
            },
          }
        })
        if (!activeResultId) {
          setActiveResultId(resultId)
        }

        // 파싱된 리뷰 저장
        return true
      } else {
        const error = await response.json()
        throw new Error(error.error || 'OCR 처리 실패')
      }

    } catch (error) {
      console.error('OCR 에러:', error)
      updateResult(resultId, {
        status: 'error',
        progress: 100,
        error: error instanceof Error ? error.message : '텍스트 인식 실패',
      })
      return false
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }

  // 리뷰 저장
  const saveReview = async (reviewData: any) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: reviewData.platform || '기타',
          business: reviewData.business || '',
          rating: reviewData.rating || 5,
          content: reviewData.content,
          author: reviewData.author || '고객',
          reviewDate: reviewData.reviewDate || new Date().toISOString(),
          link: reviewData.link || ''
        })
      })

      if (!response.ok) {
        throw new Error('리뷰 저장 실패')
      }
    } catch (error) {
      console.error('리뷰 저장 에러:', error)
    }
  }

  // 일괄 OCR 처리
  const processAllFiles = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    setCurrentProgress(0)

    let successCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const result = ocrResults[i]
      const ok = await performOCR(file, result.id)
      if (ok) {
        successCount += 1
      }

      const overallProgress = Math.round(((i + 1) / files.length) * 100)
      setCurrentProgress(overallProgress)
    }

    setIsProcessing(false)

    toast({
      title: 'OCR 처리 완료',
      description: `${successCount}/${files.length}개 스크린샷이 성공적으로 인식되었습니다.`,
    })

    setTimeout(() => setCurrentProgress(0), 800)
  }

  const activeResult = activeResultId ? ocrResults.find(r => r.id === activeResultId) : undefined
  const activeIndex = activeResult ? ocrResults.findIndex(r => r.id === activeResult.id) : -1
  const activeForm = activeResultId ? editingData[activeResultId] : undefined

  const getStatusBadge = (result: OCRResult) => {
    if (result.saved) {
      return { label: '저장 완료', className: 'border-green-200 bg-green-50 text-green-600' }
    }
    switch (result.status) {
      case 'success':
        return { label: '인식 완료', className: 'border-blue-200 bg-blue-50 text-blue-600' }
      case 'processing':
        return { label: '인식 중', className: 'border-orange-200 bg-orange-50 text-orange-600 animate-pulse' }
      case 'error':
        return { label: '재확인 필요', className: 'border-red-200 bg-red-50 text-red-600' }
      default:
        return { label: '대기 중', className: 'border-gray-200 bg-gray-50 text-gray-500' }
    }
  }

  const updateEditingField = (id: string, field: keyof ReviewFormState, value: string | number) => {
    setEditingData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
  }

  const goToResultIndex = (index: number) => {
    if (index >= 0 && index < ocrResults.length) {
      setActiveResultId(ocrResults[index].id)
    }
  }

  const handleSaveActiveReview = async () => {
    if (!activeResultId || !activeResult) return
    const form = editingData[activeResultId]
    if (!form) return

    try {
      await saveReview({
        platform: form.platform,
        business: form.business,
        rating: form.rating,
        content: form.content,
        author: form.author,
        reviewDate: form.reviewDate,
        link: form.link,
      })

      updateResult(activeResultId, { saved: true })

      toast({
        title: '리뷰 저장 완료',
        description: `${activeResult.fileName} 리뷰가 저장되었습니다.`,
      })

      const nextIndex = ocrResults.findIndex(r => r.id === activeResultId) + 1
      if (nextIndex < ocrResults.length) {
        goToResultIndex(nextIndex)
      }
    } catch (error) {
      console.error('리뷰 저장 실패:', error)
      toast({
        title: '저장 실패',
        description: '리뷰 저장 중 문제가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      })
    }
  }

  const handleSkipCurrent = () => {
    if (!activeResultId) return
    const currentIdx = ocrResults.findIndex(r => r.id === activeResultId)
    if (currentIdx >= 0 && currentIdx < ocrResults.length - 1) {
      goToResultIndex(currentIdx + 1)
    }
  }

  // 텍스트 직접 붙여넣기 처리
  const handlePasteText = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text')
    if (pastedText) {
      // 간단한 파싱
      const lines = pastedText.split('\n').filter(line => line.trim())
      const reviewData = {
        content: pastedText,
        rating: 5,
        platform: '직접입력',
        author: '고객',
        reviewDate: new Date().toISOString()
      }

      // 평점 찾기
      const ratingMatch = pastedText.match(/[★⭐]{1,5}/)
      if (ratingMatch) {
        reviewData.rating = ratingMatch[0].length
      }

      // 플랫폼 찾기
      const platformMatch = pastedText.match(/(네이버|카카오|구글|인스타)/)
      if (platformMatch) {
        reviewData.platform = platformMatch[1]
      }

      await saveReview(reviewData)

      toast({
        title: "리뷰 추가됨",
        description: "텍스트가 성공적으로 저장되었습니다",
      })

      // 텍스트 영역 초기화
      if (e.currentTarget) {
        e.currentTarget.value = ''
      }
    }
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
  }

  if (!session) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="mr-2" />
                대시보드로 돌아가기
              </Button>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">리뷰 일괄 업로드</h1>
          <p className="text-gray-600 mt-2">
            여러 플랫폼에서 받은 리뷰 스크린샷을 한 번에 업로드하고 AI OCR로 즉시 저장하세요.
          </p>
        </div>

        {/* 탭 선택 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedTab === 'image' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('image')}
            className={selectedTab === 'image' ? 'bg-[#FF6B35] hover:bg-[#E55A2B]' : ''}
          >
            <ImageIcon className="mr-2" />
            이미지 OCR
          </Button>
          <Button
            variant={selectedTab === 'paste' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('paste')}
            className={selectedTab === 'paste' ? 'bg-[#FF6B35] hover:bg-[#E55A2B]' : ''}
          >
            직접 입력
          </Button>
        </div>

        {selectedTab === 'image' ? (
          <>
            <Card className="mb-6">
              <CardContent className="p-8">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-[#FF6B35] transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">
                    리뷰 스크린샷을 드래그하거나 클릭하여 선택
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    PNG, JPG, JPEG 형식 지원 (최대 10MB)
                  </p>
                  <Button className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                    파일 선택
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageFileSelect}
                    className="hidden"
                  />
                </div>

                {files.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        선택된 스크린샷 <span className="font-semibold text-[#FF6B35]">{files.length}</span>개
                      </p>
                      <div className="flex items-center gap-3">
                        {isProcessing && (
                          <span className="text-xs font-semibold text-[#FF6B35]">
                            전체 진행률 {Math.round(currentProgress)}%
                          </span>
                        )}
                        <Button
                          onClick={processAllFiles}
                          disabled={isProcessing}
                          className="bg-[#FF6B35] hover:bg-[#E55A2B]"
                        >
                          {isProcessing ? (
                            <>
                              <ReloadIcon className="mr-2 animate-spin" />
                              처리 중...
                            </>
                          ) : (
                            <>
                              <CheckCircledIcon className="mr-2" />
                              OCR 시작
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {isProcessing && <Progress value={currentProgress} className="h-2" />}

                    <div className="space-y-3">
                      {ocrResults.map(result => {
                        const status = getStatusBadge(result)
                        return (
                          <div
                            key={result.id}
                            className={`p-4 rounded-xl border transition-colors ${
                              activeResultId === result.id
                                ? 'border-[#FF6B35] bg-orange-50/40'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                              <div className="flex items-start gap-3">
                                {result.previewUrl ? (
                                  <div className="hidden sm:block w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                    <img
                                      src={result.previewUrl}
                                      alt={result.fileName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="hidden sm:flex w-16 h-16 items-center justify-center rounded-xl bg-gray-100 text-gray-400 border border-gray-200">
                                    <ImageIcon className="w-6 h-6" />
                                  </div>
                                )}
                                <div className="w-9 h-9 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center font-semibold">
                                  {result.order}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{result.fileName}</p>
                                  <div className="mt-2 flex items-center gap-3">
                                    <Progress value={result.progress} className="h-2 w-36" />
                                    <span className="text-xs text-gray-500">
                                      {Math.round(result.progress)}%
                                    </span>
                                    {typeof result.confidence === 'number' && (
                                      <span className="text-xs text-gray-400">
                                        신뢰도 {Math.round(result.confidence * 100)}%
                                      </span>
                                    )}
                                  </div>
                                  {result.error && (
                                    <p className="text-xs text-red-500 mt-2">{result.error}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${status.className}`}>
                                  {status.label}
                                </span>
                                <Button
                                  size="sm"
                                  variant={activeResultId === result.id ? 'default' : 'outline'}
                                  onClick={() => setActiveResultId(result.id)}
                                >
                                  검토하기
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {activeResult && activeForm && (
              <Card className="mb-6">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>리뷰 {activeIndex + 1} / {ocrResults.length}</span>
                      {typeof activeResult.confidence === 'number' && (
                        <span>신뢰도 {Math.round(activeResult.confidence * 100)}%</span>
                      )}
                      {activeResult.saved && (
                        <Badge variant="outline" className="border-green-200 text-green-600">저장 완료</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl text-gray-900 mt-2">추출된 내용 확인</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">이미지를 보면서 필요한 부분만 수정하세요.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => goToResultIndex(activeIndex - 1)} disabled={activeIndex <= 0}>
                      이전
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => goToResultIndex(activeIndex + 1)} disabled={activeIndex >= ocrResults.length - 1}>
                      다음
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-6 lg:grid-cols-[340px,1fr]">
                  <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                      {activeResult.previewUrl && (
                        <img
                          src={activeResult.previewUrl}
                          alt={activeResult.fileName}
                          className="w-full object-contain max-h-[420px] bg-white"
                        />
                      )}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/85 text-xs font-medium text-gray-700">
                        원본 이미지
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200 text-xs text-orange-700 space-y-1">
                      <p>• OCR 결과를 검토하고 오타가 있으면 바로 수정하세요.</p>
                      <p>• 수정한 내용은 저장 후 리뷰 목록에 반영됩니다.</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">플랫폼</p>
                      <div className="flex flex-wrap gap-2">
                       {['네이버', '카카오맵', '구글', '인스타그램', '크몽', '기타'].map(option => (
                         <Button
                            key={option}
                            variant={activeForm.platform === option ? 'default' : 'outline'}
                            size="sm"
                            className={activeForm.platform === option ? 'bg-[#FF6B35] hover:bg-[#E55A2B]' : ''}
                            onClick={() => activeResultId && updateEditingField(activeResultId, 'platform', option)}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">평점</p>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map(score => (
                          <Button
                            key={score}
                            variant={activeForm.rating === score ? 'default' : 'outline'}
                            size="sm"
                            className={activeForm.rating === score ? 'bg-[#FF6B35] hover:bg-[#E55A2B]' : ''}
                            onClick={() => activeResultId && updateEditingField(activeResultId, 'rating', score)}
                          >
                            {score}점
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">업체명</p>
                        <Input
                          value={activeForm.business}
                          onChange={(e) => activeResultId && updateEditingField(activeResultId, 'business', e.target.value)}
                          placeholder="업체명"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">작성자</p>
                        <Input
                          value={activeForm.author}
                          onChange={(e) => activeResultId && updateEditingField(activeResultId, 'author', e.target.value)}
                          placeholder="작성자"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">작성일</p>
                        <Input
                          type="date"
                          value={activeForm.reviewDate}
                          onChange={(e) => activeResultId && updateEditingField(activeResultId, 'reviewDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">원본 링크 (선택)</p>
                        <Input
                          value={activeForm.link}
                          onChange={(e) => activeResultId && updateEditingField(activeResultId, 'link', e.target.value)}
                          placeholder="https://"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">리뷰 내용</p>
                      <Textarea
                        value={activeForm.content}
                        onChange={(e) => activeResultId && updateEditingField(activeResultId, 'content', e.target.value)}
                        rows={10}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardContent className="pt-0 pb-6">
                  <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={handleSkipCurrent}>건너뛰기</Button>
                    <Button className="bg-[#FF6B35] hover:bg-[#E55A2B]" onClick={handleSaveActiveReview}>
                      저장
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>✨ 고정밀 OCR 시스템</CardTitle>
                <CardDescription>
                  Google Vision AI로 정확한 텍스트 추출
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🎯</span>
                  <div>
                    <p className="font-medium">95%+ 정확도</p>
                    <p className="text-sm text-gray-500">한글 리뷰 인식에 최적화</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🤖</span>
                  <div>
                    <p className="font-medium">자동 정보 추출</p>
                    <p className="text-sm text-gray-500">플랫폼, 평점, 작성자, 날짜 자동 파싱</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🆓</span>
                  <div>
                    <p className="font-medium">월 1,000건 무료</p>
                    <p className="text-sm text-gray-500">Google Cloud 무료 티어 활용</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* 텍스트 붙여넣기 탭 */
          <Card>
            <CardHeader>
              <CardTitle>텍스트 직접 입력</CardTitle>
              <CardDescription>
                리뷰 텍스트를 복사해서 붙여넣으세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                placeholder="리뷰 텍스트를 여기에 붙여넣으세요...

예시:
⭐⭐⭐⭐⭐
김서연 강사님 최고예요! 자세 하나하나 꼼꼼하게 봐주시고...
- 정** 님, 2024.08.07"
                onPaste={handlePasteText}
              />
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  💡 <strong>팁:</strong> 플랫폼, 평점, 작성자, 날짜 정보가 포함되면 자동으로 인식됩니다
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
