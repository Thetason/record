"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { ArrowLeftIcon, UploadIcon, CameraIcon, Shield, Droplets } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form-simple"
import { Badge } from "@/components/ui/badge"
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ReviewForm>()

  const selectedPlatform = watch("platform")

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  const onSubmit = async (data: ReviewForm) => {
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
          verifiedBy: uploadedImage ? 'screenshot' : data.originalUrl ? 'manual' : null
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "리뷰 추가 실패")
      }

      router.push("/dashboard/reviews")
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
      setUploadedFile(file)
      const reader = new FileReader()
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
      }
      reader.readAsDataURL(file)
    }
  }

  const handleOCRExtract = async () => {
    if (!uploadedFile) {
      alert("이미지를 먼저 업로드해주세요")
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
      
      // 추출된 데이터를 폼에 자동 입력
      console.log('OCR 결과:', data)
      
      if (data.processedData) {
        const { businessName, authorName, rating, reviewDate, platform, content } = data.processedData
        
        // 비즈니스명 설정
        if (businessName) setValue("businessName", businessName)
        
        // 작성자명 설정
        if (authorName) setValue("customerName", authorName)
        
        // 평점 설정
        if (rating) setValue("rating", rating.toString())
        
        // 날짜 설정
        if (reviewDate) setValue("reviewDate", reviewDate)
        
        // 플랫폼 설정
        if (platform && platform !== "기타") {
          setValue("platform", platform)
        }
        
        // 리뷰 내용 설정
        if (content) {
          setValue("content", content)
        } else if (data.text) {
          setValue("content", data.text)
        }
      } else if (data.text) {
        // processedData가 없어도 텍스트만 있으면 내용에 입력
        setValue("content", data.text)
      }
      
      // 전체 텍스트를 리뷰 내용에 입력
      if (data.text) {
        setValue("content", data.text)
      }

      alert(data.isDemo 
        ? "데모 텍스트가 입력되었습니다. Google Vision API 키를 설정하면 실제 OCR이 가능합니다." 
        : "텍스트가 성공적으로 추출되었습니다!")
    } catch (error: any) {
      console.error("OCR error:", error)
      setError(error.message || "텍스트 추출 중 오류가 발생했습니다")
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>대시보드로 돌아가기</span>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            새 리뷰 추가
          </h1>
          <p className="text-gray-600">
            받으신 리뷰를 직접 입력하거나 이미지로 업로드하여 추가하세요
          </p>
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
                  <p className="font-semibold mb-1">💡 OCR 기능 사용법</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>리뷰 스크린샷을 업로드</li>
                    <li>'텍스트 추출' 버튼 클릭</li>
                    <li>자동으로 입력된 정보 확인</li>
                    <li>필요시 수정 후 저장</li>
                  </ol>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                      <UploadIcon className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          리뷰 이미지를 드래그하거나 클릭하여 업로드
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
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg cursor-pointer hover:bg-[#E55A2B] transition-colors"
                        >
                          <UploadIcon className="w-4 h-4" />
                          이미지 선택
                        </label>
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
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    placeholder="리뷰 내용을 입력하세요..."
                    {...register("content", {
                      required: "리뷰 내용을 입력해주세요",
                      minLength: {
                        value: 10,
                        message: "리뷰 내용은 최소 10자 이상이어야 합니다"
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

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    asChild
                  >
                    <Link href="/dashboard">취소</Link>
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#FF6B35] hover:bg-[#E55A2B]"
                    disabled={isLoading}
                  >
                    {isLoading ? "추가 중..." : "리뷰 추가"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}