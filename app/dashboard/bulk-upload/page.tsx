"use client"

import { useState, useRef, useCallback } from "react"
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
import { useToast } from "@/components/ui/use-toast"

interface OCRResult {
  id: string
  fileName: string
  status: 'pending' | 'processing' | 'success' | 'error'
  text?: string
  parsed?: any
  error?: string
  confidence?: number
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
  const [selectedTab, setSelectedTab] = useState<'upload' | 'paste'>('upload')

  // 파일 선택 처리
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    setFiles(imageFiles)
    
    // OCR 결과 초기화
    const initialResults: OCRResult[] = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      status: 'pending'
    }))
    setOcrResults(initialResults)
  }

  // 드래그 앤 드롭 처리
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    const imageFiles = droppedFiles.filter(file => 
      file.type.startsWith('image/')
    )
    
    setFiles(imageFiles)
    
    const initialResults: OCRResult[] = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      status: 'pending'
    }))
    setOcrResults(initialResults)
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Google Vision API를 사용한 OCR
  const performOCR = async (file: File, resultId: string) => {
    try {
      // 결과 상태 업데이트 - processing
      setOcrResults(prev => prev.map(r => 
        r.id === resultId ? { ...r, status: 'processing' } : r
      ))

      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        
        setOcrResults(prev => prev.map(r => 
          r.id === resultId ? { 
            ...r, 
            status: 'success',
            text: data.text,
            parsed: data.parsed,
            confidence: data.confidence
          } : r
        ))
        
        // 파싱된 리뷰 저장
        if (data.parsed && data.parsed.content) {
          await saveReview(data.parsed)
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'OCR 처리 실패')
      }
      
    } catch (error) {
      console.error('OCR 에러:', error)
      setOcrResults(prev => prev.map(r => 
        r.id === resultId ? { 
          ...r, 
          status: 'error',
          error: error instanceof Error ? error.message : '텍스트 인식 실패'
        } : r
      ))
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
          reviewDate: reviewData.reviewDate || new Date().toISOString()
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
    setIsProcessing(true)
    setCurrentProgress(0)
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const result = ocrResults[i]
      
      await performOCR(file, result.id)
      
      // 전체 진행률 업데이트
      const overallProgress = ((i + 1) / files.length) * 100
      setCurrentProgress(overallProgress)
    }
    
    setIsProcessing(false)
    
    const successCount = ocrResults.filter(r => r.status === 'success').length
    
    toast({
      title: "OCR 처리 완료",
      description: `${successCount}/${files.length}개 파일 처리 성공`,
    })
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
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeftIcon className="mr-2" />
              대시보드로 돌아가기
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">대량 리뷰 업로드</h1>
          <p className="text-gray-600 mt-2">
            스크린샷에서 리뷰를 자동으로 추출합니다 (Google Vision AI)
          </p>
        </div>

        {/* 탭 선택 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedTab === 'upload' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('upload')}
            className={selectedTab === 'upload' ? 'bg-[#FF6B35] hover:bg-[#E55A2B]' : ''}
          >
            <ImageIcon className="mr-2" />
            이미지 업로드
          </Button>
          <Button
            variant={selectedTab === 'paste' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('paste')}
            className={selectedTab === 'paste' ? 'bg-[#FF6B35] hover:bg-[#E55A2B]' : ''}
          >
            텍스트 붙여넣기
          </Button>
        </div>

        {selectedTab === 'upload' ? (
          <>
            {/* 업로드 영역 */}
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
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {files.length > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm font-medium">
                        {files.length}개 파일 선택됨
                      </p>
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

                    {isProcessing && (
                      <Progress value={currentProgress} className="mb-4" />
                    )}

                    {/* OCR 결과 목록 */}
                    <div className="space-y-2">
                      {ocrResults.map(result => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            {result.status === 'pending' && (
                              <div className="w-5 h-5 rounded-full bg-gray-200" />
                            )}
                            {result.status === 'processing' && (
                              <ReloadIcon className="w-5 h-5 text-orange-500 animate-spin" />
                            )}
                            {result.status === 'success' && (
                              <CheckCircledIcon className="w-5 h-5 text-green-500" />
                            )}
                            {result.status === 'error' && (
                              <CrossCircledIcon className="w-5 h-5 text-red-500" />
                            )}
                            
                            <div className="flex-1">
                              <p className="text-sm font-medium">{result.fileName}</p>
                              {result.parsed && (
                                <p className="text-xs text-gray-500">
                                  {result.parsed.platform && `${result.parsed.platform} • `}
                                  {result.parsed.rating && `${result.parsed.rating}점 • `}
                                  {result.parsed.author}
                                </p>
                              )}
                              {result.error && (
                                <p className="text-xs text-red-500">{result.error}</p>
                              )}
                            </div>
                          </div>

                          {result.text && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // 수정 기능 추가 예정
                                console.log('Edit:', result.text)
                              }}
                            >
                              수정
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 안내 사항 */}
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
                    <p className="text-sm text-gray-500">
                      한글 리뷰 인식에 최적화
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🤖</span>
                  <div>
                    <p className="font-medium">자동 정보 추출</p>
                    <p className="text-sm text-gray-500">
                      플랫폼, 평점, 작성자, 날짜 자동 파싱
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🆓</span>
                  <div>
                    <p className="font-medium">월 1,000건 무료</p>
                    <p className="text-sm text-gray-500">
                      Google Cloud 무료 티어 활용
                    </p>
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