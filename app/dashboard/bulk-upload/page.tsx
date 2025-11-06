"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeftIcon,
  UploadIcon,
  ImageIcon,
  CheckCircledIcon,
  ReloadIcon,
  Pencil1Icon
} from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type ParsedReview = Partial<ReviewFormState>
type ReviewInput = Partial<ReviewFormState> & { content: string }

interface OCRResult {
  id: string
  fileName: string
  status: 'pending' | 'processing' | 'success' | 'error'
  progress: number
  text?: string
  parsed?: ParsedReview
  error?: string
  confidence?: number
  previewUrl?: string
  saved?: boolean
  order: number
  file?: File
}

type ReviewFormState = {
  platform: string
  business: string
  author: string
  reviewDate: string
  content: string
  link: string
}

export default function BulkUploadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedPlatform, setSelectedPlatform] = useState<string>('') // 이미지 업로드 전 플랫폼 선택
  const [batchBusinessName, setBatchBusinessName] = useState<string>('') // 일괄 입력할 업체명
  const [showBusinessNamePopup, setShowBusinessNamePopup] = useState(false) // 업체명 팝업 표시 여부
  const [showPlatformEdit, setShowPlatformEdit] = useState(false) // 플랫폼 편집 모드
  const [showBusinessEdit, setShowBusinessEdit] = useState(false) // 업체명 편집 모드
  const [businessInputTimer, setBusinessInputTimer] = useState<NodeJS.Timeout | null>(null) // 업체명 입력 타이머
  const [files, setFiles] = useState<File[]>([])
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(0)
  // 이미지 업로드만 사용
  const [activeResultId, setActiveResultId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Record<string, ReviewFormState>>({})
  const ocrVersion = 'v2' // OCR 알고리즘 버전 (V2 영역기반 - 가장 정확함)

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
        file: file, // 원본 파일 저장
      }
    })

    const initialEditing: Record<string, ReviewFormState> = {}
    initialResults.forEach(result => {
      initialEditing[result.id] = {
        platform: selectedPlatform || '네이버', // 사용자가 선택한 플랫폼 사용
        business: batchBusinessName || '', // 일괄 입력한 업체명 사용
        author: '익명',
        reviewDate: defaultDate,
        content: '',
        link: '',
      }
    })

    setOcrResults(initialResults)
    setEditingData(initialEditing)
    setActiveResultId(null)
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
      formData.append('version', ocrVersion) // OCR 버전 추가
      if (selectedPlatform) {
        formData.append('platform', selectedPlatform) // 사용자가 선택한 플랫폼 전달
      }

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const json = await response.json() as {
          success?: boolean
          data?: {
            text?: string
            normalizedText?: string
            reviewText?: string
            platform?: string
            business?: string
            author?: string
            date?: string
            confidence?: number
            originalUrl?: string
          }
        }

        const payload = json.data ?? {}
        const parsedData: ParsedReview = {
          platform: payload.platform,
          business: payload.business,
          author: payload.author,
          reviewDate: payload.date,
          content: payload.reviewText ?? payload.text ?? payload.normalizedText ?? '',
          link: payload.originalUrl,
        }

        if (progressInterval) clearInterval(progressInterval)
        updateResult(resultId, {
          status: 'success',
          progress: 100,
          text: parsedData.content,
          parsed: parsedData,
          confidence: payload.confidence,
        })

        setEditingData(prev => {
          const existing = prev[resultId]
          const defaultDate = existing?.reviewDate || new Date().toISOString().slice(0, 10)
          return {
            ...prev,
            [resultId]: {
              // 사용자가 선택한 플랫폼 우선, 없으면 OCR 결과, 없으면 기존 값
              platform: selectedPlatform || parsedData.platform || existing?.platform || '네이버',
              // 사용자가 입력한 업체명 우선, 없으면 OCR 결과, 없으면 기존 값
              business: batchBusinessName || parsedData.business || existing?.business || '',
              author: parsedData.author || existing?.author || '익명',
              reviewDate: parsedData.reviewDate?.slice(0, 10) || defaultDate,
              content: parsedData.content || existing?.content || '',
              link: parsedData.link || existing?.link || '',
            },
          }
        })

        return true
      } else {
        const errorBody = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(errorBody?.error || '이미지 인식 실패')
      }

    } catch (error) {
      console.error('이미지 인식 에러:', error)
      const errorMessage = error instanceof Error ? error.message : '텍스트 인식 실패'

      updateResult(resultId, {
        status: 'error',
        progress: 100,
        error: errorMessage,
      })

      // Rate limit 에러는 재시도를 위해 throw
      if (errorMessage.includes('너무 많습니다') || errorMessage.includes('429')) {
        throw error
      }

      return false
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }

  const saveReview = async (reviewData: ReviewInput & { imageFile?: File }) => {
    try {
      // 필수 필드 검증
      if (!reviewData.content || reviewData.content.trim().length < 10) {
        throw new Error('리뷰 내용은 최소 10자 이상이어야 합니다.')
      }

      // 이미지를 base64로 변환 (있는 경우)
      let imageUrl = ''
      if (reviewData.imageFile) {
        const bytes = await reviewData.imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        imageUrl = `data:${reviewData.imageFile.type};base64,${buffer.toString('base64')}`
      }

      const payload = {
        platform: reviewData.platform ?? '기타',
        business: reviewData.business && reviewData.business.trim() !== '' 
          ? reviewData.business.trim() 
          : '업체명 미확인',
        content: reviewData.content.trim(),
        author: reviewData.author ?? '고객',
        reviewDate: reviewData.reviewDate ?? new Date().toISOString(),
        originalUrl: reviewData.link ?? '',
        imageUrl: imageUrl || undefined
      }

      console.log('💾 저장 시도:', { ...payload, imageUrl: imageUrl ? `[${imageUrl.length}자 base64]` : 'none' })

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include' // 쿠키 포함
      })

      console.log('📡 응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ 서버 에러:', errorData)
        throw new Error(errorData.message || `서버 오류 (${response.status}): ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ 저장 성공:', result)
      return result
    } catch (error) {
      console.error('🔥 리뷰 저장 에러:', error)
      throw error
    }
  }

  const processAllFiles = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    setCurrentProgress(0)

    let successCount = 0
    let firstSuccessId: string | null = null // 첫 번째 성공한 리뷰 ID 저장

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const result = ocrResults[i]

      // Rate limit 회피를 위한 재시도 로직 추가
      let ok = false
      let retries = 3

      while (retries > 0 && !ok) {
        try {
          ok = await performOCR(file, result.id)
          if (ok) {
            successCount += 1
            // 첫 번째 성공한 리뷰 ID 저장
            if (!firstSuccessId) {
              firstSuccessId = result.id
            }
            break
          }
        } catch (error: any) {
          retries--
          if (error.message?.includes('너무 많습니다') || error.message?.includes('429')) {
            // Rate limit 에러인 경우 2초 대기 후 재시도
            if (retries > 0) {
              console.log(`Rate limit 에러, ${2}초 후 재시도... (남은 시도: ${retries})`)
              await new Promise(resolve => setTimeout(resolve, 2000))
            }
          } else {
            // 다른 에러는 재시도하지 않음
            break
          }
        }
      }

      const overallProgress = Math.round(((i + 1) / files.length) * 100)
      setCurrentProgress(overallProgress)

      // 각 이미지 처리 후 1초 대기 (Rate limit 회피)
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    setIsProcessing(false)

    toast({
      title: '인식 완료',
      description: `${successCount}/${files.length}개 이미지에서 리뷰를 성공적으로 추출했습니다.`,
    })

    setTimeout(() => setCurrentProgress(0), 800)

    // 첫 번째 성공한 리뷰 자동 확장
    if (firstSuccessId) {
      setTimeout(() => {
        setActiveResultId(firstSuccessId)
        console.log(`✅ 첫 번째 리뷰 자동 확장: ${firstSuccessId}`)
      }, 1200) // 약간의 딜레이로 state 업데이트 보장
    }

    // 업체명 일괄 입력 팝업 표시
    if (successCount > 0 && !batchBusinessName) {
      setTimeout(() => {
        setShowBusinessNamePopup(true)
      }, 1500)
    }
  }

  const activeResult = activeResultId ? ocrResults.find(r => r.id === activeResultId) : undefined
  const activeIndex = activeResult ? ocrResults.findIndex(r => r.id === activeResult.id) : -1
  const activeForm = activeResultId ? editingData[activeResultId] : undefined

  const updateEditingField = (id: string, field: keyof ReviewFormState, value: string) => {
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

  // 일괄 업체명 적용 함수
  const applyBatchBusinessName = (businessName: string) => {
    setBatchBusinessName(businessName)
    setEditingData(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(key => {
        updated[key] = {
          ...updated[key],
          business: businessName
        }
      })
      return updated
    })
    setShowBusinessNamePopup(false)
    toast({
      title: '✅ 업체명 일괄 적용 완료',
      description: `모든 리뷰에 "${businessName}"이(가) 적용되었습니다.`,
    })
  }

  const handleSaveActiveReview = async () => {
    if (!activeResultId || !activeResult) return
    const form = editingData[activeResultId]
    if (!form) return

    // 저장 전 필수 필드 검증 및 사용자 알림
    if (!form.content || form.content.trim().length === 0) {
      toast({
        title: '⚠️ 리뷰 내용이 비어있어요',
        description: '이미지에서 텍스트를 인식하지 못했습니다. 리뷰 내용을 직접 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (form.content.trim().length < 10) {
      toast({
        title: '⚠️ 리뷰 내용이 너무 짧아요',
        description: `현재 ${form.content.trim().length}자입니다. 최소 10자 이상 입력해주세요.`,
        variant: 'destructive',
      })
      return
    }

    try {
      await saveReview({
        platform: form.platform,
        business: form.business,
        content: form.content,
        author: form.author,
        reviewDate: form.reviewDate,
        link: form.link,
        imageFile: activeResult.file, // 원본 이미지 파일 포함
      })

      updateResult(activeResultId, { saved: true })

      toast({
        title: '✅ 리뷰 저장 완료',
        description: `${activeResult.fileName} 리뷰가 성공적으로 저장되었습니다.`,
      })

      // 모든 리뷰를 저장한 경우 리뷰 관리 페이지로 이동
      const nextIndex = ocrResults.findIndex(r => r.id === activeResultId) + 1
      const allSaved = ocrResults.filter(r => r.saved || r.id === activeResultId).length === ocrResults.length
      
      if (allSaved) {
        // 모두 저장 완료 - 리뷰 관리 페이지로 이동
        toast({
          title: '🎉 전체 저장 완료!',
          description: '모든 리뷰가 저장되었습니다. 리뷰 관리 페이지로 이동합니다.',
        })
        setTimeout(() => {
          router.push('/dashboard/reviews')
        }, 1500)
      } else if (nextIndex < ocrResults.length) {
        goToResultIndex(nextIndex)
      } else {
        setActiveResultId(null)
      }
    } catch (error) {
      console.error('리뷰 저장 실패:', error)
      toast({
        title: '❌ 저장 실패',
        description: error instanceof Error ? error.message : '리뷰 저장 중 문제가 발생했습니다. 다시 시도해주세요.',
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

  const handlePasteText = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text')
    if (pastedText) {
      const reviewData: ReviewInput = {
        content: pastedText,
        platform: '직접입력',
        author: '고객',
        reviewDate: new Date().toISOString()
      }

      const platformMatch = pastedText.match(/(네이버|카카오|구글|인스타|당근)/)
      if (platformMatch) {
        const mapping: Record<string, string> = {
          '카카오': '카카오맵',
          '인스타': '인스타그램',
          '당근': '당근'
        }
        reviewData.platform = mapping[platformMatch[1]] || platformMatch[1]
      }

      await saveReview(reviewData)

      toast({
        title: "리뷰 추가됨",
        description: "텍스트가 성공적으로 저장되었습니다",
      })

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="mr-2" />
                대시보드
              </Button>
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">리뷰 빠른 등록</h1>
          <p className="text-gray-600 text-lg">
            여러 개의 리뷰 이미지를 한번에 올리고 몇 초 만에 저장 완료 ✨
          </p>
        </div>

        {/* 사용 방법 안내 */}
        <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF6B35] text-white font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <p className="text-gray-900 font-medium">어떤 플랫폼의 리뷰인가요?</p>
                  <p className="text-sm text-gray-600 mt-1">아래에서 플랫폼을 먼저 선택해주세요 (정확한 인식을 위해 필수!)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF6B35] text-white font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <p className="text-gray-900 font-medium">리뷰 이미지를 업로드하세요</p>
                  <p className="text-sm text-gray-600 mt-1">스크린샷을 드래그하거나 클릭하여 파일 선택</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF6B35] text-white font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <p className="text-gray-900 font-medium">'자동 인식 시작' 버튼을 클릭하세요</p>
                  <p className="text-sm text-gray-600 mt-1">AI가 자동으로 리뷰 내용을 분석하고 추출해드려요 ✨</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 플랫폼 선택 & 업체명 입력 - 한 줄로 배치 */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* 플랫폼 선택 */}
          <Card className="border-2 border-[#FF6B35]">
            <CardHeader>
              <div>
                <CardTitle className="text-xl">1️⃣ 리뷰 플랫폼 선택</CardTitle>
                {!selectedPlatform || showPlatformEdit ? (
                  <CardDescription>정확한 리뷰 추출을 위해 플랫폼을 먼저 선택해주세요</CardDescription>
                ) : (
                  <div className="mt-4">
                    <div className="inline-flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#FF6B35] flex items-center justify-center animate-in fade-in zoom-in duration-300">
                          <CheckCircledIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900 text-base">{selectedPlatform}</span>
                      </div>
                      <button
                        onClick={() => setShowPlatformEdit(!showPlatformEdit)}
                        className="ml-2 text-sm text-[#FF6B35] hover:text-[#E55A2B] transition-colors font-medium"
                      >
                        변경
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            {(!selectedPlatform || showPlatformEdit) && (
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {['네이버', '카카오맵', '당근', '크몽', '구글', '인스타그램', 'Re:cord', '기타'].map((platform) => (
                    <Button
                      key={platform}
                      variant={selectedPlatform === platform ? 'default' : 'outline'}
                      className={`h-12 text-sm font-semibold transition-all ${
                        selectedPlatform === platform
                          ? 'bg-[#FF6B35] hover:bg-[#E55A2B] shadow-lg scale-105'
                          : 'hover:border-[#FF6B35]'
                      }`}
                      onClick={() => {
                        setSelectedPlatform(platform)
                        setShowPlatformEdit(false)
                      }}
                    >
                      {platform}
                    </Button>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* 업체명 입력 (선택사항) */}
          {selectedPlatform && (
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <div>
                  <CardTitle className="text-xl">2️⃣ 업체명 입력 (선택사항)</CardTitle>
                  {!batchBusinessName || showBusinessEdit ? (
                    <CardDescription>모든 리뷰가 같은 업체의 리뷰라면 미리 입력하세요</CardDescription>
                  ) : (
                    <div className="mt-4">
                      <div className="inline-flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#FF6B35] flex items-center justify-center animate-in fade-in zoom-in duration-300">
                            <CheckCircledIcon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-bold text-gray-900 text-base">{batchBusinessName}</span>
                        </div>
                        <button
                          onClick={() => setShowBusinessEdit(!showBusinessEdit)}
                          className="ml-2 text-sm text-[#FF6B35] hover:text-[#E55A2B] transition-colors font-medium"
                        >
                          수정
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              {(!batchBusinessName || showBusinessEdit) && (
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="예: 클라우딘뮤직, 서울 맛집 등..."
                      value={batchBusinessName}
                      onChange={(e) => {
                        const value = e.target.value
                        setBatchBusinessName(value)

                        // 기존 타이머 제거
                        if (businessInputTimer) {
                          clearTimeout(businessInputTimer)
                        }

                        // 5초 후 자동 확정
                        if (value.trim()) {
                          const timer = setTimeout(() => {
                            setShowBusinessEdit(false)
                          }, 5000)
                          setBusinessInputTimer(timer)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && batchBusinessName.trim()) {
                          if (businessInputTimer) {
                            clearTimeout(businessInputTimer)
                          }
                          setShowBusinessEdit(false)
                        }
                      }}
                      className="flex-1 h-12 text-base border-gray-200 focus:border-[#FF6B35] focus:ring-[#FF6B35] rounded-xl"
                    />
                    <Button
                      onClick={() => {
                        if (batchBusinessName.trim()) {
                          if (businessInputTimer) {
                            clearTimeout(businessInputTimer)
                          }
                          setShowBusinessEdit(false)
                        }
                      }}
                      disabled={!batchBusinessName.trim()}
                      className="h-12 px-8 bg-[#FF6B35] hover:bg-[#E55A2B] disabled:bg-gray-200 disabled:text-gray-400 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      적용
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                    <span>💡</span>
                    <span>Enter 키 또는 5초간 입력이 없으면 자동 적용됩니다</span>
                  </p>
                </CardContent>
              )}
            </Card>
          )}
        </div>

            {/* 업로드 영역 */}
            {!selectedPlatform ? (
              <Card className="mb-6 border-2 border-dashed border-gray-300">
                <CardContent className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">
                    플랫폼을 먼저 선택해주세요
                  </h3>
                  <p className="text-gray-400">
                    정확한 리뷰 인식을 위해 플랫폼 선택이 필요합니다
                  </p>
                </CardContent>
              </Card>
            ) : files.length === 0 ? (
              <Card className="mb-6 border-2 border-dashed hover:border-[#FF6B35] transition-all duration-300">
                <CardContent className="p-12">
                  <div
                    className="text-center cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 mb-6">
                      <UploadIcon className="w-10 h-10 text-[#FF6B35]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">
                      리뷰 이미지를 드래그하세요
                    </h3>
                    <p className="text-gray-500 mb-6">
                      또는 클릭하여 파일을 선택하세요
                    </p>
                    <Button className="bg-[#FF6B35] hover:bg-[#E55A2B] text-lg px-8 py-6">
                      파일 선택하기
                    </Button>
                    <p className="text-xs text-gray-400 mt-4">
                      PNG, JPG, JPEG 지원 · 최대 10MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageFileSelect}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* 3D 스택 카드 영역 */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        업로드된 리뷰 <span className="text-[#FF6B35]">{ocrResults.length}</span>개
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        카드를 클릭하여 리뷰를 확인하고 저장하세요
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {isProcessing && (
                        <div className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-full border border-orange-200">
                          <ReloadIcon className="w-5 h-5 text-[#FF6B35] animate-spin" />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[#FF6B35]">
                              처리 중... {Math.round(currentProgress)}%
                            </span>
                            <span className="text-xs text-gray-600">
                              이미지에서 리뷰 내용을 추출하고 있습니다
                            </span>
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={processAllFiles}
                        disabled={isProcessing}
                        className={`bg-[#FF6B35] hover:bg-[#E55A2B] text-lg px-8 py-6 font-bold text-white transition-all ${
                          !isProcessing ? 'animate-pulse shadow-2xl shadow-orange-500/80 ring-4 ring-orange-300 ring-opacity-50' : ''
                        }`}
                        style={{
                          animation: isProcessing
                            ? 'none'
                            : 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite, glow 2s ease-in-out infinite',
                          boxShadow: !isProcessing
                            ? '0 0 30px rgba(255, 107, 53, 0.8), 0 0 60px rgba(255, 107, 53, 0.5), 0 0 90px rgba(255, 107, 53, 0.3)'
                            : undefined
                        }}
                      >
                        {isProcessing ? (
                          <>
                            <ReloadIcon className="mr-2 animate-spin" />
                            처리 중...
                          </>
                        ) : (
                          <>
                            <CheckCircledIcon className="mr-2 w-6 h-6" />
                            ✨ 자동 인식 시작 ✨
                          </>
                        )}
                      </Button>
                      <style jsx>{`
                        @keyframes glow {
                          0%, 100% {
                            filter: brightness(1);
                          }
                          50% {
                            filter: brightness(1.3);
                          }
                        }
                      `}</style>
                    </div>
                  </div>

                  {/* 3D 스택 카드 컨테이너 */}
                  <div className="relative" style={{ perspective: '1500px', minHeight: `${Math.max(600, ocrResults.length * 80)}px` }}>
                    <div className="relative w-full max-w-md mx-auto">
                      {ocrResults.slice().reverse().map((result, reverseIndex) => {
                        const index = ocrResults.length - 1 - reverseIndex
                        const isActive = activeResultId === result.id
                        
                        // 상태별 색상
                        const getCardColors = () => {
                          if (result.saved) {
                            return {
                              bg: 'from-emerald-500 to-green-600',
                              text: 'text-white',
                              border: 'border-emerald-400'
                            }
                          }
                          switch (result.status) {
                            case 'processing':
                              return {
                                bg: 'from-orange-400 to-orange-600',
                                text: 'text-white',
                                border: 'border-orange-300'
                              }
                            case 'success':
                              return {
                                bg: 'from-blue-400 to-blue-600',
                                text: 'text-white',
                                border: 'border-blue-300'
                              }
                            case 'error':
                              return {
                                bg: 'from-red-400 to-red-600',
                                text: 'text-white',
                                border: 'border-red-300'
                              }
                            default:
                              return {
                                bg: 'from-gray-100 to-gray-200',
                                text: 'text-gray-700',
                                border: 'border-gray-300'
                              }
                          }
                        }

                        const colors = getCardColors()
                        // 아래로 쌓이되 윗부분이 보이도록
                        const offset = index * 70
                        const scale = 1 - (index * 0.03)
                        // zIndex는 1번이 가장 높아야 위에 있음
                        const zIndex = ocrResults.length - index

                        return (
                          <div
                            key={result.id}
                            className={`absolute top-0 left-0 w-full transition-all duration-500 cursor-pointer ${
                              isActive ? 'scale-105 shadow-2xl z-50' : ''
                            }`}
                            style={{
                              transform: isActive 
                                ? 'translateY(0) scale(1)' 
                                : `translateY(${offset}px) scale(${scale})`,
                              zIndex: isActive ? 9999 : zIndex,
                              transformStyle: 'preserve-3d',
                            }}
                            onClick={() => setActiveResultId(result.id)}
                          >
                            <div
                              className={`relative bg-gradient-to-br ${colors.bg} rounded-3xl border-2 ${colors.border} overflow-hidden transition-all duration-300 ${
                                result.status === 'processing' ? 'animate-pulse' : ''
                              }`}
                              style={{
                                boxShadow: isActive 
                                  ? '0 20px 60px -10px rgba(0,0,0,0.3)' 
                                  : `0 ${8 + index * 2}px ${20 + index * 4}px -${5 + index}px rgba(0,0,0,0.15)`
                              }}
                            >
                              {/* 카드 내용 */}
                              <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full ${colors.text === 'text-white' ? 'bg-white/20' : 'bg-gray-300'} flex items-center justify-center font-bold text-lg ${colors.text}`}>
                                      {result.order}
                                    </div>
                                    <div>
                                      <p className={`font-bold text-lg ${colors.text} truncate max-w-[200px]`}>
                                        {result.fileName}
                                      </p>
                                      <p className={`text-sm ${colors.text} opacity-90`}>
                                        {result.saved ? '✓ 저장 완료' :
                                         result.status === 'processing' ? '처리 중...' :
                                         result.status === 'success' ? '인식 완료' :
                                         result.status === 'error' ? (
                                           <span className="flex items-center gap-1">
                                             <span>⚠️</span>
                                             <span className="truncate">{result.error || '오류 발생'}</span>
                                           </span>
                                         ) :
                                         '대기 중'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* 미리보기 이미지 */}
                                {result.previewUrl && (
                                  <div className="relative w-full h-48 rounded-xl overflow-hidden bg-white/10 mb-4">
                                    <Image
                                      src={result.previewUrl}
                                      alt={result.fileName}
                                      fill
                                      sizes="400px"
                                      className="object-cover"
                                    />
                                  </div>
                                )}

                                {/* 진행률 바 */}
                                {result.status !== 'pending' && (
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className={colors.text}>진행률</span>
                                      <span className={`font-bold ${colors.text}`}>
                                        {Math.round(result.progress)}%
                                      </span>
                                    </div>
                                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-white rounded-full transition-all duration-500"
                                        style={{ width: `${result.progress}%` }}
                                      />
                                    </div>
                                    {typeof result.confidence === 'number' && (
                                      <p className={`text-xs ${colors.text} opacity-80`}>
                                        신뢰도: {Math.round(result.confidence * 100)}%
                                      </p>
                                    )}
                                  </div>
                                )}

                                {result.error && (
                                  <p className="text-sm text-white/90 mt-2 bg-black/20 p-2 rounded">
                                    {result.error}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* 리뷰 편집 영역 */}
                {activeResult && activeForm && (
                  <Card className="mb-6 border-2 border-[#FF6B35]">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl text-gray-900">리뷰 검토 및 수정</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {activeIndex + 1} / {ocrResults.length} · 내용을 확인하고 수정하세요
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => goToResultIndex(activeIndex - 1)} 
                            disabled={activeIndex <= 0}
                          >
                            ← 이전
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => goToResultIndex(activeIndex + 1)} 
                            disabled={activeIndex >= ocrResults.length - 1}
                          >
                            다음 →
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-6 lg:grid-cols-2">
                        {/* 원본 이미지 */}
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-3">원본 이미지</p>
                          <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-gray-50">
                            {activeResult.previewUrl && (
                              <div className="relative w-full h-[400px]">
                                <Image
                                  src={activeResult.previewUrl}
                                  alt={activeResult.fileName}
                                  fill
                                  sizes="(min-width: 1024px) 50vw, 100vw"
                                  className="object-contain"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 폼 필드 */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-2">플랫폼</p>
                            <div className="flex flex-wrap gap-2">
                              {['네이버', '카카오맵', '구글', '인스타그램', '당근', 'Re:cord', '크몽', '기타'].map(option => (
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
                              <p className="text-xs font-semibold text-gray-600 mb-2">원본 링크</p>
                              <Input
                                value={activeForm.link}
                                onChange={(e) => activeResultId && updateEditingField(activeResultId, 'link', e.target.value)}
                                placeholder="https://"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-gray-600">리뷰 내용</p>
                              {activeResult?.status === 'success' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    if (!activeResultId || !activeResult.file) return
                                    
                                    toast({
                                      title: '🔄 정밀 인식 시작',
                                      description: '노이즈를 제거하고 리뷰 본문만 정밀하게 추출합니다.',
                                    })
                                    
                                    // 같은 버전으로 재시도하되 retry 모드 활성화
                                    updateResult(activeResultId, { 
                                      status: 'processing',
                                      progress: 0 
                                    })
                                    
                                    const formData = new FormData()
                                    formData.append('image', activeResult.file)
                                    formData.append('version', ocrVersion) // 같은 버전 사용
                                    formData.append('retry', 'true') // 재시도 모드 활성화
                                    if (selectedPlatform) {
                                      formData.append('platform', selectedPlatform) // 사용자가 선택한 플랫폼 전달
                                    }

                                    try {
                                      const response = await fetch('/api/ocr', {
                                        method: 'POST',
                                        body: formData
                                      })
                                      
                                      if (response.ok) {
                                        const json = await response.json()
                                        const payload = json.data ?? {}
                                        const parsedData: ParsedReview = {
                                          platform: payload.platform,
                                          business: payload.business,
                                          author: payload.author,
                                          reviewDate: payload.date,
                                          content: payload.reviewText ?? payload.text ?? payload.normalizedText ?? '',
                                          link: payload.originalUrl,
                                        }
                                        
                                        updateResult(activeResultId, {
                                          status: 'success',
                                          progress: 100,
                                          parsed: parsedData,
                                          confidence: payload.confidence
                                        })
                                        
                                        setEditingData(prev => ({
                                          ...prev,
                                          [activeResultId]: {
                                            // 사용자가 선택한 플랫폼 우선
                                            platform: selectedPlatform || parsedData.platform || prev[activeResultId]?.platform || '네이버',
                                            // 사용자가 입력한 업체명 우선
                                            business: batchBusinessName || parsedData.business || prev[activeResultId]?.business || '',
                                            author: parsedData.author || prev[activeResultId]?.author || '',
                                            reviewDate: parsedData.reviewDate || prev[activeResultId]?.reviewDate || new Date().toISOString().split('T')[0],
                                            content: parsedData.content || '',
                                            link: parsedData.link || prev[activeResultId]?.link || ''
                                          }
                                        }))
                                        
                                        toast({
                                          title: '✅ 정밀 인식 완료',
                                          description: '리뷰 본문을 깔끔하게 추출했습니다.',
                                        })
                                      } else {
                                        throw new Error('OCR 실패')
                                      }
                                    } catch (error) {
                                      updateResult(activeResultId, {
                                        status: 'error',
                                        error: '2차 OCR 실패'
                                      })
                                      
                                      toast({
                                        title: '❌ 정밀 인식 실패',
                                        description: '다시 시도하거나 직접 수정해주세요.',
                                        variant: 'destructive'
                                      })
                                    }
                                  }}
                                  className="text-xs h-7"
                                >
                                  <ReloadIcon className="mr-1 w-3 h-3" />
                                  🔄 정밀 인식
                                </Button>
                              )}
                            </div>
                            <Textarea
                              value={activeForm.content}
                              onChange={(e) => activeResultId && updateEditingField(activeResultId, 'content', e.target.value)}
                              rows={8}
                              className="resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              💡 추출 결과가 불완전한 경우 "2차 OCR 재시도" 버튼을 눌러보세요
                            </p>
                          </div>

                          <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" onClick={handleSkipCurrent}>
                              건너뛰기
                            </Button>
                            <Button 
                              className="bg-[#FF6B35] hover:bg-[#E55A2B] px-8"
                              onClick={handleSaveActiveReview}
                            >
                              <CheckCircledIcon className="mr-2" />
                              저장하고 다음으로
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* 자동 인식 안내 */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  AI 자동 인식
                </CardTitle>
                <CardDescription className="text-blue-900/70">
                  이미지에서 리뷰 내용을 자동으로 추출합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="font-semibold text-gray-900">95%+ 정확도</p>
                    <p className="text-sm text-gray-600">한글 리뷰 인식 최적화</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="font-semibold text-gray-900">스마트 자동 파싱</p>
                    <p className="text-sm text-gray-600">플랫폼, 업체명, 작성자, 날짜 자동 추출</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-semibold text-gray-900">초고속 처리</p>
                    <p className="text-sm text-gray-600">이미지 1장당 평균 2-3초</p>
                  </div>
                </div>
              </CardContent>
            </Card>

        {/* 업체명 일괄 입력 팝업 */}
        {showBusinessNamePopup && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBusinessNamePopup(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  💼 업체명 일괄 입력
                </h3>
                <p className="text-sm text-gray-600">
                  이 리뷰들은 같은 업체에서 받은 리뷰인가요?
                </p>
                <p className="text-sm text-gray-600">
                  업체명을 입력하시면 모든 리뷰에 자동으로 적용됩니다.
                </p>
              </div>

              <Input
                placeholder="예: 오픈런 카페, 서울 맛집 등..."
                value={batchBusinessName}
                onChange={(e) => setBatchBusinessName(e.target.value)}
                className="mb-4 text-lg h-12"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && batchBusinessName.trim()) {
                    applyBatchBusinessName(batchBusinessName.trim())
                  }
                }}
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowBusinessNamePopup(false)}
                >
                  나중에 입력
                </Button>
                <Button
                  className="flex-1 bg-[#FF6B35] hover:bg-[#E55A2B]"
                  onClick={() => {
                    if (batchBusinessName.trim()) {
                      applyBatchBusinessName(batchBusinessName.trim())
                    } else {
                      toast({
                        title: '⚠️ 업체명을 입력해주세요',
                        description: '업체명을 입력하거나 "나중에 입력" 버튼을 눌러주세요.',
                        variant: 'destructive',
                      })
                    }
                  }}
                  disabled={!batchBusinessName.trim()}
                >
                  일괄 적용
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
