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
  ReloadIcon,
  DownloadIcon,
  FileTextIcon
} from "@radix-ui/react-icons"
import { FileSpreadsheet, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
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
  const [selectedTab, setSelectedTab] = useState<'image' | 'csv' | 'paste'>('csv')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [bulkUploadResult, setBulkUploadResult] = useState<BulkUploadResult | null>(null)

  // 이미지 파일 선택 처리
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
    
    setFiles(imageFiles)
    
    // OCR 결과 초기화
    const initialResults: OCRResult[] = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      status: 'pending'
    }))
    setOcrResults(initialResults)
  }

  // CSV/Excel 파일 선택 처리
  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0]
    if (file) {
      const fileName = file.name.toLowerCase()
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        toast({
          title: "잘못된 파일 형식",
          description: "CSV 또는 Excel 파일만 지원됩니다",
          variant: "destructive"
        })
        return
      }
      setCsvFile(file)
      setBulkUploadResult(null)
    }
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

  // CSV/Excel 파일 업로드 처리
  const processCsvFile = async () => {
    if (!csvFile) {
      toast({
        title: "파일을 선택해주세요",
        description: "CSV 또는 Excel 파일을 선택해야 합니다",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    setCurrentProgress(0)
    setBulkUploadResult(null)

    try {
      const progressInterval = setInterval(() => {
        setCurrentProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const formData = new FormData()
      formData.append("file", csvFile)

      const res = await fetch("/api/reviews/bulk", {
        method: "POST",
        body: formData
      })

      clearInterval(progressInterval)
      setCurrentProgress(100)

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "업로드 실패")
      }

      setBulkUploadResult(data)
      
      if (data.success && data.created > 0) {
        setTimeout(() => {
          setCsvFile(null)
          setCurrentProgress(0)
        }, 2000)
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      setBulkUploadResult({
        success: false,
        message: error.message || "업로드 중 오류가 발생했습니다"
      })
    } finally {
      setIsProcessing(false)
      setTimeout(() => setCurrentProgress(0), 1000)
    }
  }

  // 템플릿 다운로드 개선
  const downloadTemplate = () => {
    // 더 상세하고 다양한 예시 포함
    const csvContent = `플랫폼,업체명,작성자,평점,내용,날짜
네이버,김서연 필라테스,김**,5,정말 친절하고 꼼꼼하게 가르쳐주세요! 몸의 변화가 확실히 느껴집니다.,2024-01-20
카카오맵,서울 미용실,이**,4,컷트 실력이 좋아요. 다만 주차가 조금 불편합니다.,2024-01-18
구글,정아 네일샵,박**,5,디자인 정말 예쁘게 잘해주시고 오래 유지됩니다!,2024-01-15
인스타그램,맛집카페,최**,5,분위기도 좋고 음식도 맛있어요! 재방문 의사 100%,2024.01.10
네이버,ABC 치과,익명,4,진료 꼼꼼하게 잘 봐주시네요 추천합니다,2024/01/05
카카오맵,OO 헤어샵,정**,3,일반적인 서비스 수준이에요,01-01-2024`

    // UTF-8 BOM 추가로 한글 깨짐 방지
    const BOM = String.fromCharCode(0xFEFF)
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "리뷰_업로드_템플릿.csv")
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Excel 템플릿 다운로드
  const downloadExcelTemplate = async () => {
    const data = [
      ["플랫폼", "업체명", "작성자", "평점", "내용", "날짜"],
      ["네이버", "김서연 필라테스", "김**", 5, "정말 친절하고 꼼꼼하게 가르쳐주세요! 몸의 변화가 확실히 느껴집니다.", "2024-01-20"],
      ["카카오맵", "서울 미용실", "이**", 4, "컷트 실력이 좋아요. 다만 주차가 조금 불편합니다.", "2024-01-18"],
      ["구글", "정아 네일샵", "박**", 5, "디자인 정말 예쁘게 잘해주시고 오래 유지됩니다!", "2024-01-15"],
      ["인스타그램", "맛집카페", "최**", 5, "분위기도 좋고 음식도 맛있어요! 재방문 의사 100%", "2024-01-10"],
      ["네이버", "ABC 치과", "익명", 4, "진료 꼼꼼하게 잘 봐주시네요 추천합니다", "2024-01-05"]
    ]

    try {
      // 동적 import로 번들 크기 최적화
      const XLSX = await import('xlsx')
      const ws = XLSX.utils.aoa_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "리뷰 템플릿")
      XLSX.writeFile(wb, "리뷰_업로드_템플릿.xlsx")
    } catch (error) {
      console.error('Excel 템플릿 생성 오류:', error)
      toast({
        title: "Excel 템플릿 생성 실패",
        description: "CSV 템플릿을 대신 다운로드하겠습니다",
        variant: "default"
      })
      downloadTemplate()
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
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="mr-2" />
                대시보드로 돌아가기
              </Button>
            </Link>
            {selectedTab === 'csv' && (
              <div className="flex gap-2">
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <DownloadIcon className="w-4 h-4" />
                  CSV 템플릿
                </Button>
                <Button
                  onClick={downloadExcelTemplate}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel 템플릿
                </Button>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">리뷰 일괄 업로드</h1>
          <p className="text-gray-600 mt-2">
            CSV/Excel 파일 또는 이미지로 여러 리뷰를 한번에 업로드하세요
          </p>
        </div>

        {/* 탭 선택 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedTab === 'csv' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('csv')}
            className={selectedTab === 'csv' ? 'bg-[#FF6B35] hover:bg-[#E55A2B]' : ''}
          >
            <FileTextIcon className="mr-2" />
            CSV/Excel 업로드
          </Button>
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
            텍스트 붙여넣기
          </Button>
        </div>

        {selectedTab === 'csv' ? (
          /* CSV/Excel 업로드 탭 */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 가이드 */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">업로드 가이드</CardTitle>
                <CardDescription>
                  파일 형식과 필수 항목을 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">1</Badge>
                    <div>
                      <p className="font-semibold text-sm">지원 파일 형식</p>
                      <p className="text-xs text-gray-600 mt-1">
                        CSV (.csv) 또는 Excel (.xlsx, .xls)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">2</Badge>
                    <div>
                      <p className="font-semibold text-sm">필수 컬럼</p>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        <li>• 플랫폼 (네이버, 카카오맵, 구글 등)</li>
                        <li>• 업체명</li>
                        <li>• 내용 (리뷰 본문)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">3</Badge>
                    <div>
                      <p className="font-semibold text-sm">선택 컬럼</p>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        <li>• 작성자 (기본: 익명)</li>
                        <li>• 평점 (기본: 5점)</li>
                        <li>• 날짜 (기본: 오늘)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-3">
                    💡 템플릿 파일을 다운로드하여 양식을 확인하세요
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      <strong>주의사항:</strong>
                    </p>
                    <ul className="text-xs text-amber-700 mt-1 space-y-1">
                      <li>• 최대 파일 크기: 5MB</li>
                      <li>• 최대 리뷰 수: 1,000개</li>
                      <li>• 중복 리뷰는 자동 제외</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 업로드 섹션 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>파일 업로드</CardTitle>
                <CardDescription>
                  리뷰 데이터가 포함된 파일을 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 파일 업로드 영역 */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      csvFile 
                        ? 'border-[#FF6B35] bg-orange-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {csvFile ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          {csvFile.name.endsWith('.csv') ? (
                            <FileText className="w-16 h-16 text-[#FF6B35]" />
                          ) : (
                            <FileSpreadsheet className="w-16 h-16 text-[#FF6B35]" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{csvFile.name}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {(csvFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCsvFile(null)
                            setBulkUploadResult(null)
                          }}
                        >
                          다른 파일 선택
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <UploadIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-gray-600 mb-2">
                            파일을 드래그하거나 클릭하여 선택
                          </p>
                          <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleCsvFileSelect}
                            className="hidden"
                            id="csv-file-upload"
                          />
                          <label
                            htmlFor="csv-file-upload"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <FileTextIcon className="w-4 h-4" />
                            파일 선택
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          CSV, XLSX, XLS 파일 지원 (최대 5MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 업로드 진행률 */}
                  {isProcessing && (
                    <div className="space-y-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ReloadIcon className="w-4 h-4 animate-spin text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            파일 처리 중...
                          </span>
                        </div>
                        <span className="text-sm font-bold text-blue-800">
                          {currentProgress}%
                        </span>
                      </div>
                      <Progress value={currentProgress} className="h-3" />
                      <div className="grid grid-cols-3 gap-4 text-xs text-blue-700">
                        <div className="text-center">
                          <div className="font-semibold">1. 파일 읽기</div>
                          <div className={currentProgress >= 20 ? "text-green-600" : ""}>
                            {currentProgress >= 20 ? "✓ 완료" : "진행 중..."}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">2. 데이터 검증</div>
                          <div className={currentProgress >= 60 ? "text-green-600" : ""}>
                            {currentProgress >= 60 ? "✓ 완료" : currentProgress >= 20 ? "진행 중..." : "대기 중"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">3. 데이터베이스 저장</div>
                          <div className={currentProgress >= 90 ? "text-green-600" : ""}>
                            {currentProgress >= 90 ? "✓ 완료" : currentProgress >= 60 ? "진행 중..." : "대기 중"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 업로드 결과 */}
                  {bulkUploadResult && (
                    <div className={`rounded-lg p-4 ${
                      bulkUploadResult.success 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        {bulkUploadResult.success ? (
                          <CheckCircledIcon className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : (
                          <CrossCircledIcon className="w-5 h-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`font-semibold ${
                            bulkUploadResult.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {bulkUploadResult.message}
                          </p>
                          
                          {bulkUploadResult.success && bulkUploadResult.summary && (
                            <div className="mt-4">
                              {/* 성공 요약 정보 */}
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-white rounded-lg p-3 border border-green-300">
                                  <div className="text-lg font-bold text-green-800">
                                    {bulkUploadResult.summary.successfullyCreated}
                                  </div>
                                  <div className="text-xs text-green-600">성공적으로 추가</div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-green-300">
                                  <div className="text-lg font-bold text-green-800">
                                    {bulkUploadResult.summary.totalProcessed}
                                  </div>
                                  <div className="text-xs text-green-600">총 처리된 행</div>
                                </div>
                              </div>
                              
                              {(bulkUploadResult.summary.duplicatesSkipped > 0 || 
                                bulkUploadResult.summary.validationErrors > 0) && (
                                <div className="space-y-2 text-sm text-green-700">
                                  {bulkUploadResult.summary.duplicatesSkipped > 0 && (
                                    <p>• 중복 제외: {bulkUploadResult.summary.duplicatesSkipped}개</p>
                                  )}
                                  {bulkUploadResult.summary.validationErrors > 0 && (
                                    <p>• 검증 오류: {bulkUploadResult.summary.validationErrors}개</p>
                                  )}
                                  {bulkUploadResult.summary.processingErrors > 0 && (
                                    <p>• 처리 오류: {bulkUploadResult.summary.processingErrors}개</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* 이전 버전 호환성 */}
                          {bulkUploadResult.success && !bulkUploadResult.summary && (
                            <div className="mt-3 space-y-1 text-sm text-green-700">
                              <p>• 전체 리뷰: {bulkUploadResult.total}개</p>
                              <p>• 추가된 리뷰: {bulkUploadResult.created}개</p>
                              {bulkUploadResult.skipped! > 0 && (
                                <p>• 중복 제외: {bulkUploadResult.skipped}개</p>
                              )}
                            </div>
                          )}
                          
                          {bulkUploadResult.errors && bulkUploadResult.errors.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-semibold text-red-700 mb-2">
                                오류 상세 ({bulkUploadResult.errors.length}개):
                              </p>
                              <div className="max-h-32 overflow-y-auto bg-white rounded border border-red-200 p-2">
                                <ul className="space-y-1">
                                  {bulkUploadResult.errors.map((error, index) => (
                                    <li key={index} className="text-xs text-red-600 flex items-start gap-1">
                                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                      <span className="break-words">{error}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      asChild
                    >
                      <Link href="/dashboard">취소</Link>
                    </Button>
                    <Button
                      className="flex-1 bg-[#FF6B35] hover:bg-[#E55A2B]"
                      onClick={processCsvFile}
                      disabled={!csvFile || isProcessing}
                    >
                      {isProcessing ? "업로드 중..." : "업로드"}
                    </Button>
                  </div>

                  {bulkUploadResult?.success && bulkUploadResult.created! > 0 && (
                    <div className="text-center">
                      <Button
                        variant="link"
                        className="text-[#FF6B35] hover:text-[#E55A2B]"
                        asChild
                      >
                        <Link href="/dashboard/reviews">
                          업로드된 리뷰 보기 →
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : selectedTab === 'image' ? (
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
                    onChange={handleImageFileSelect}
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