"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { ArrowLeftIcon, UploadIcon, CameraIcon, CheckIcon } from "@radix-ui/react-icons"
import { Shield, Droplets, Save, Eye, CloudUpload, Sparkles, Clock, AlertCircle, FileText, Image as ImageIcon, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form-simple"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { addWatermark, addSimpleWatermark } from "@/lib/watermark"

interface ReviewForm {
  platform: string
  businessName: string
  customerName: string
  content: string
  rating: number
  reviewDate: string
  originalUrl?: string
}

const platforms = [
  { value: "네이버", label: "네이버", color: "bg-green-100 text-green-800" },
  { value: "카카오맵", label: "카카오맵", color: "bg-yellow-100 text-yellow-800" },
  { value: "구글", label: "구글", color: "bg-blue-100 text-blue-800" },
  { value: "크몽", label: "크몽", color: "bg-purple-100 text-purple-800" },
  { value: "인스타그램", label: "인스타그램", color: "bg-pink-100 text-pink-800" },
  { value: "기타", label: "기타", color: "bg-gray-100 text-gray-800" }
]

export default function AddReviewPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState("")
  const [watermarkEnabled, setWatermarkEnabled] = useState(true)
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [ocrResult, setOcrResult] = useState<any>(null)
  
  // 새로운 UX 개선 상태
  const [showPreview, setShowPreview] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [batchFiles, setBatchFiles] = useState<File[]>([])
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0)
  const [successMessage, setSuccessMessage] = useState("")
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null)
  const [isQuickMode, setIsQuickMode] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues
  } = useForm<ReviewForm>()

  const selectedPlatform = watch("platform")
  const formValues = watch()

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled) return
    
    const saveTimer = setTimeout(() => {
      const values = getValues()
      if (values.businessName || values.content || values.customerName) {
        localStorage.setItem('review-draft', JSON.stringify(values))
        setLastSaved(new Date())
      }
    }, 2000)

    return () => clearTimeout(saveTimer)
  }, [formValues, autoSaveEnabled, getValues])

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('review-draft')
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        Object.keys(draft).forEach(key => {
          setValue(key as keyof ReviewForm, draft[key])
        })
        setSuccessMessage("이전 작성 내용을 불러왔습니다")
        setTimeout(() => setSuccessMessage(""), 3000)
      } catch (e) {
        console.error('Failed to load draft:', e)
      }
    }
  }, [setValue])

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  const processImageFile = async (file: File, isBatch: boolean = false) => {
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setError("이미지 파일만 업로드할 수 있습니다")
      return
    }

    // 파일 크기 검증
    if (file.size > 10 * 1024 * 1024) {
      setError("파일 크기는 10MB 이하여야 합니다")
      return
    }

    setUploadedFile(file)
    setError("")
    setUploadProgress(0)

    // 업로드 진행상황 시뮬레이션
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    const reader = new FileReader()
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100
        setUploadProgress(Math.round(percentComplete * 0.9)) // 90%까지만
      }
    }
    
    reader.onload = async (e) => {
      const originalImage = e.target?.result as string
      setUploadedImage(originalImage)
      
      // 워터마크 추가
      if (watermarkEnabled && session?.user?.username) {
        try {
          const watermarked = await addWatermark(originalImage, `Re:cord @${session.user.username}`)
          setWatermarkedImage(watermarked)
        } catch (error) {
          console.error('Failed to add watermark:', error)
          setWatermarkedImage(originalImage)
        }
      } else {
        setWatermarkedImage(originalImage)
      }
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // 배치 모드에서 자동 OCR 실행
      if (isBatch && isQuickMode) {
        setTimeout(() => handleOCRExtract(), 500)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      if (files.length === 1) {
        await processImageFile(files[0])
      } else {
        // 배치 모드 활성화
        setBatchFiles(files)
        setCurrentBatchIndex(0)
        setSuccessMessage(`${files.length}개의 파일이 준비되었습니다. 하나씩 처리할 수 있습니다.`)
        await processImageFile(files[0], true)
      }
    }
  }
  
  const handleNextBatchFile = async () => {
    if (currentBatchIndex < batchFiles.length - 1) {
      const nextIndex = currentBatchIndex + 1
      setCurrentBatchIndex(nextIndex)
      await processImageFile(batchFiles[nextIndex], true)
    }
  }

  const onSubmit = async (data: ReviewForm) => {
    // 미리보기 모드 처리
    if (showPreview) {
      setShowPreview(false)
      return
    }
    
    setIsLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: data.platform,
          business: data.businessName,
          author: data.customerName,
          content: data.content,
          rating: parseInt(data.rating.toString()),
          reviewDate: data.reviewDate,
          imageUrl: watermarkEnabled && watermarkedImage ? watermarkedImage : uploadedImage,
          originalUrl: data.originalUrl,
          verifiedBy: uploadedImage ? 'screenshot' : data.originalUrl ? 'manual' : null,
          ocrConfidence: ocrConfidence // OCR 신뢰도 저장
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || errorData.error || "리뷰 추가에 실패했습니다.")
      }

      // 성공 시 로컬 스토리지 초기화
      localStorage.removeItem('review-draft')
      
      // 성공 메시지 표시
      setSuccessMessage("리뷰가 성공적으로 추가되었습니다!")
      
      // 배치 모드 처리
      if (batchFiles.length > 0 && currentBatchIndex < batchFiles.length - 1) {
        setTimeout(() => {
          handleNextBatchFile()
        }, 1500)
      } else {
        setTimeout(() => {
          router.push("/dashboard/reviews")
        }, 1500)
      }
    } catch (error: any) {
      console.error("Add review error:", error)
      setError(error.message || "리뷰 추가 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await processImageFile(file)
    }
  }

  const handleOCRExtract = async () => {
    if (!uploadedFile) {
      setError("이미지를 먼저 업로드해주세요")
      return
    }

    // 파일 크기 체크 (클라이언트 측)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      setError("파일 크기는 10MB 이하여야 합니다")
      return
    }

    setIsExtracting(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("image", uploadedFile)

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "텍스트 추출 실패")
      }

      const data = await res.json()
      console.log('OCR 결과:', data)
      
      // 추출 결과 처리
      let fieldsUpdated = 0
      
      if (data.parsed) {
        const { platform, business, rating, content, author, reviewDate } = data.parsed
        
        // 플랫폼 설정
        if (platform && platform.trim()) {
          const matchedPlatform = platforms.find(p => 
            platform.includes(p.value) || p.value.includes(platform)
          )
          if (matchedPlatform) {
            setValue("platform", matchedPlatform.value)
            fieldsUpdated++
          }
        }
        
        // 비즈니스명 설정
        if (business && business.trim()) {
          setValue("businessName", business.trim())
          fieldsUpdated++
        }
        
        // 평점 설정
        if (rating && rating >= 1 && rating <= 5) {
          setValue("rating", rating.toString())
          fieldsUpdated++
        }
        
        // 작성자명 설정
        if (author && author.trim()) {
          setValue("customerName", author.trim())
          fieldsUpdated++
        }
        
        // 날짜 설정
        if (reviewDate && reviewDate.trim()) {
          setValue("reviewDate", reviewDate)
          fieldsUpdated++
        }
        
        // 리뷰 내용 설정
        if (content && content.trim() && content.length >= 5) {
          setValue("content", content.trim())
          fieldsUpdated++
        }
      } else if (data.text && data.text.trim() && data.text.length >= 10) {
        // 파싱된 데이터가 없으면 전체 텍스트를 내용에 입력
        setValue("content", data.text.trim())
        fieldsUpdated++
      }

      // 결과 피드백
      if (data.success === false) {
        setError(data.message || "이미지에서 텍스트를 찾을 수 없습니다")
      } else if (fieldsUpdated === 0) {
        setError("추출된 정보가 없습니다. 더 선명한 이미지를 사용해보세요")
      } else {
        const confidence = Math.round((data.confidence || 0.95) * 100)
        setOcrConfidence(confidence)
        
        const message = data.isMockData 
          ? `테스트 모드: 샘플 데이터가 입력되었습니다.
Google Vision API를 설정하면 실제 OCR이 작동합니다.`
          : `${fieldsUpdated}개 필드가 자동으로 입력되었습니다!`
        
        setSuccessMessage(message)
        setTimeout(() => setSuccessMessage(""), 5000)
      }

    } catch (error: any) {
      console.error("OCR error:", error)
      let errorMessage = "텍스트 추출 중 오류가 발생했습니다"
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요"
      } else if (error.message.includes('timeout')) {
        errorMessage = "요청 시간이 초과되었습니다. 더 작은 이미지를 사용해보세요"
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>대시보드로 돌아가기</span>
          </Link>
          
          {/* 자동 저장 인디케이터 */}
          <div className="flex items-center gap-4">
            {lastSaved && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CheckIcon className="w-3 h-3 text-green-500" />
                자동 저장됨 ({new Date(lastSaved).toLocaleTimeString()})
              </div>
            )}
            
            {/* 빠른 모드 토글 */}
            <button
              onClick={() => setIsQuickMode(!isQuickMode)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isQuickMode 
                  ? 'bg-[#FF6B35] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              빠른 모드
            </button>
            
            {/* 배치 모드 인디케이터 */}
            {batchFiles.length > 0 && (
              <Badge className="bg-purple-600">
                배치: {currentBatchIndex + 1}/{batchFiles.length}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* 성공 메시지 */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 animate-slideIn">
            <CheckIcon className="w-4 h-4" />
            {successMessage}
          </div>
        )}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            새 리뷰 추가
          </h1>
          <p className="text-gray-600">
            받으신 리뷰를 직접 입력하거나 이미지로 업로드하여 추가하세요
          </p>
          
          {/* 빠른 통계 */}
          {isQuickMode && (
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                평균 처리 시간: 30초
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                AI 자동 입력
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* OCR Upload Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CameraIcon className="w-5 h-5" />
                이미지 업로드
              </CardTitle>
              <CardDescription>
                리뷰 스크린샷을 업로드하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  <p className="font-semibold mb-1">
                    {isQuickMode ? '⚡ 빠른 모드 활성화' : '💡 OCR 기능 사용법'}
                  </p>
                  {isQuickMode ? (
                    <p className="text-xs">이미지를 업로드하면 자동으로 텍스트를 추출합니다</p>
                  ) : (
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>리뷰 스크린샷을 업로드</li>
                      <li>'텍스트 추출' 버튼 클릭</li>
                      <li>자동으로 입력된 정보 확인</li>
                      <li>필요시 수정 후 저장</li>
                    </ol>
                  )}
                </div>
                
                {/* OCR 신뢰도 표시 */}
                {ocrConfidence !== null && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700">OCR 신뢰도</span>
                      <span className="text-sm font-bold text-green-600">{ocrConfidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${ocrConfidence}%` }}
                      />
                    </div>
                  </div>
                )}
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver 
                      ? 'border-[#FF6B35] bg-orange-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img 
                          src={watermarkEnabled && watermarkedImage ? watermarkedImage : uploadedImage} 
                          alt="Uploaded review" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {watermarkEnabled && (
                          <Badge className="absolute top-2 right-2 bg-green-600">
                            <Shield className="w-3 h-3 mr-1" />
                            워터마크 적용됨
                          </Badge>
                        )}
                        
                        {/* 업로드 진행률 */}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <CloudUpload className="w-8 h-8 text-white mb-2 animate-pulse" />
                              <p className="text-white text-sm font-medium">{uploadProgress}%</p>
                              <div className="w-32 bg-gray-300 rounded-full h-1 mt-2">
                                <div 
                                  className="bg-white h-1 rounded-full transition-all"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={watermarkEnabled}
                            onChange={async (e) => {
                              setWatermarkEnabled(e.target.checked)
                              if (e.target.checked && uploadedImage && session?.user?.username) {
                                try {
                                  const watermarked = await addWatermark(uploadedImage, `Re:cord @${session.user.username}`)
                                  setWatermarkedImage(watermarked)
                                } catch (error) {
                                  console.error('Failed to add watermark:', error)
                                }
                              }
                            }}
                            className="rounded"
                          />
                          <Droplets className="w-4 h-4" />
                          워터마크 추가
                        </label>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleOCRExtract}
                          className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
                          size="sm"
                          disabled={isExtracting}
                        >
                          {isExtracting ? "추출 중..." : "텍스트 추출"}
                        </Button>
                        <Button
                          onClick={() => {
                            setUploadedImage(null)
                            setUploadedFile(null)
                            setWatermarkedImage(null)
                          }}
                          variant="outline"
                          size="sm"
                        >
                          다른 이미지
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <UploadIcon className={`w-12 h-12 mx-auto transition-colors ${
                        isDragOver ? 'text-[#FF6B35]' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className={`text-sm mb-2 transition-colors ${
                          isDragOver 
                            ? 'text-[#FF6B35] font-medium' 
                            : 'text-gray-600'
                        }`}>
                          {isDragOver 
                            ? '이미지를 여기에 놓아주세요' 
                            : '리뷰 이미지를 드래그하거나 클릭하여 업로드 (JPG, PNG, WebP)'}
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg cursor-pointer transition-colors ${
                            isDragOver 
                              ? 'bg-[#E55A2B]' 
                              : 'bg-[#FF6B35] hover:bg-[#E55A2B]'
                          }`}
                        >
                          <UploadIcon className="w-4 h-4" />
                          이미지 선택
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          최대 파일 크기: 10MB | 지원 형식: JPG, PNG, WebP
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Input Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>리뷰 정보 입력</CardTitle>
              <CardDescription>
                리뷰 정보를 직접 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Platform Selection */}
                <FormItem>
                  <FormLabel>플랫폼</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {platforms.map((platform) => (
                      <label
                        key={platform.value}
                        className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPlatform === platform.value
                            ? 'border-[#FF6B35] bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          value={platform.value}
                          {...register("platform", {
                            required: "플랫폼을 선택해주세요"
                          })}
                          className="sr-only"
                        />
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${platform.color}`}>
                          {platform.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.platform && <FormMessage>{errors.platform.message}</FormMessage>}
                </FormItem>

                {/* Business Name */}
                <FormItem>
                  <FormLabel htmlFor="businessName">업체명</FormLabel>
                  <Input
                    id="businessName"
                    placeholder="리뷰를 받은 업체명을 입력하세요"
                    {...register("businessName", {
                      required: "업체명을 입력해주세요"
                    })}
                  />
                  {errors.businessName && <FormMessage>{errors.businessName.message}</FormMessage>}
                </FormItem>

                {/* Customer Name */}
                <FormItem>
                  <FormLabel htmlFor="customerName">리뷰 작성자</FormLabel>
                  <Input
                    id="customerName"
                    placeholder="리뷰를 작성한 고객명 (예: 김**)"
                    {...register("customerName", {
                      required: "리뷰 작성자를 입력해주세요"
                    })}
                  />
                  {errors.customerName && <FormMessage>{errors.customerName.message}</FormMessage>}
                </FormItem>

                {/* Rating */}
                <FormItem>
                  <FormLabel htmlFor="rating">평점</FormLabel>
                  <select
                    id="rating"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    {...register("rating", {
                      required: "평점을 선택해주세요"
                    })}
                  >
                    <option value="">평점을 선택하세요</option>
                    {[5, 4, 3, 2, 1].map(num => (
                      <option key={num} value={num}>
                        {'★'.repeat(num)} ({num}점)
                      </option>
                    ))}
                  </select>
                  {errors.rating && <FormMessage>{errors.rating.message}</FormMessage>}
                </FormItem>

                {/* Review Content */}
                <FormItem>
                  <FormLabel htmlFor="content">리뷰 내용</FormLabel>
                  <textarea
                    id="content"
                    rows={4}
                    maxLength={2000}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    placeholder="리뷰 내용을 입력하세요... (최대 2000자)"
                    {...register("content", {
                      required: "리뷰 내용을 입력해주세요",
                      minLength: {
                        value: 10,
                        message: "리뷰 내용은 최소 10자 이상이어야 합니다"
                      },
                      maxLength: {
                        value: 2000,
                        message: "리뷰 내용은 최대 2000자까지만 입력할 수 있습니다"
                      }
                    })}
                  />
                  {errors.content && <FormMessage>{errors.content.message}</FormMessage>}
                </FormItem>

                {/* Review Date */}
                <FormItem>
                  <FormLabel htmlFor="reviewDate">리뷰 작성일</FormLabel>
                  <Input
                    id="reviewDate"
                    type="date"
                    {...register("reviewDate", {
                      required: "리뷰 작성일을 입력해주세요"
                    })}
                  />
                  {errors.reviewDate && <FormMessage>{errors.reviewDate.message}</FormMessage>}
                </FormItem>

                {/* Original URL */}
                <FormItem>
                  <FormLabel htmlFor="originalUrl">
                    원본 리뷰 링크 
                    <span className="text-xs text-gray-500 ml-2">(선택사항)</span>
                  </FormLabel>
                  <Input
                    id="originalUrl"
                    type="url"
                    placeholder="https://..."
                    {...register("originalUrl")}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    원본 리뷰 페이지 URL을 입력하면 검증 배지가 표시됩니다
                  </p>
                </FormItem>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4 pt-4">
                  {/* 미리보기 모드 */}
                  {showPreview && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        미리보기
                      </h4>
                      <div className="text-xs space-y-1 text-gray-700">
                        <p><strong>플랫폼:</strong> {watch("platform") || "미선택"}</p>
                        <p><strong>업체명:</strong> {watch("businessName") || "미입력"}</p>
                        <p><strong>평점:</strong> {"★".repeat(parseInt(watch("rating") || "0"))}</p>
                        <p><strong>작성자:</strong> {watch("customerName") || "미입력"}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      asChild
                    >
                      <Link href="/dashboard">취소</Link>
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPreview(!showPreview)}
                      className="px-4"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {showPreview ? "편집" : "미리보기"}
                    </Button>
                    
                    <Button
                      type="submit"
                      className="flex-1 bg-[#FF6B35] hover:bg-[#E55A2B] relative"
                      disabled={isLoading || isExtracting}
                    >
                      {isLoading ? (
                        <>
                          <CloudUpload className="w-4 h-4 mr-2 animate-pulse" />
                          저장 중...
                        </>
                      ) : batchFiles.length > 0 && currentBatchIndex < batchFiles.length - 1 ? (
                        <>다음 리뷰 ({currentBatchIndex + 2}/{batchFiles.length})</>
                      ) : (
                        "리뷰 추가"
                      )}
                    </Button>
                  </div>
                  
                  {/* 자동 저장 설정 */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSaveEnabled}
                        onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                        className="rounded"
                      />
                      <Save className="w-3 h-3" />
                      자동 저장
                    </label>
                    
                    {lastSaved && (
                      <span>마지막 저장: {new Date(lastSaved).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}