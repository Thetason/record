"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { UploadIcon, CheckIcon } from "@radix-ui/react-icons"
import { Loader2 } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form-simple"
import { Textarea } from "@/components/ui/textarea"
import SoftCard from "@/components/ui/soft-card"
import { addWatermark } from "@/lib/watermark"

interface ReviewForm {
  platform: string
  businessName: string
  customerName: string
  content: string
  reviewDate: string
  originalUrl?: string
  imageUrl?: string
}

const platforms = [
  { value: "네이버", label: "네이버", color: "bg-green-100 text-green-800" },
  { value: "카카오맵", label: "카카오맵", color: "bg-yellow-100 text-yellow-800" },
  { value: "구글", label: "구글", color: "bg-blue-100 text-blue-800" },
  { value: "인스타그램", label: "인스타그램", color: "bg-pink-100 text-pink-800" },
  { value: "당근", label: "당근", color: "bg-orange-100 text-orange-700" },
  { value: "Re:cord", label: "Re:cord", color: "bg-[#FF6B35]/10 text-[#FF6B35]" },
  { value: "크몽", label: "크몽", color: "bg-purple-100 text-purple-800" },
  { value: "기타", label: "기타", color: "bg-gray-100 text-gray-800" }
]

const MAX_CONTENT_LENGTH = 2000

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("이미지 데이터를 불러오지 못했습니다."))
      }
    }
    reader.onerror = () => reject(new Error("이미지를 읽는 중 오류가 발생했습니다."))
    reader.readAsDataURL(file)
  })
}

export default function AddReviewPage() {
  const router = useRouter()
  const { status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [watermarkEnabled, setWatermarkEnabled] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [futureDateWarning, setFutureDateWarning] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ReviewForm>({
    defaultValues: {
      platform: platforms[0]?.value ?? "",
      businessName: "",
      customerName: "",
      content: "",
      reviewDate: new Date().toISOString().slice(0, 10),
      originalUrl: "",
      imageUrl: ""
    }
  })

  const reviewDateValue = watch("reviewDate")
  const contentValue = watch("content")

  useEffect(() => {
    if (!reviewDateValue) {
      setFutureDateWarning("")
      return
    }
    const parsed = new Date(reviewDateValue)
    if (Number.isNaN(parsed.getTime())) {
      setFutureDateWarning("")
      return
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const normalized = new Date(parsed)
    normalized.setHours(0, 0, 0, 0)
    if (normalized > today) {
      setFutureDateWarning("미래 날짜가 입력되어 있습니다. 실제 리뷰 작성일로 수정해 주세요.")
    } else {
      setFutureDateWarning("")
    }
  }, [reviewDateValue])

  const generatePreview = useCallback(
    async (dataUrl: string, enableWatermark: boolean) => {
      if (!dataUrl) return
      if (!enableWatermark) {
        setPreviewImage(dataUrl)
        setValue("imageUrl", dataUrl)
        return
      }
      try {
        setIsProcessingImage(true)
        const watermarked = await addWatermark(dataUrl)
        setPreviewImage(watermarked)
        setValue("imageUrl", watermarked)
      } catch (processingError) {
        console.error("워터마크 처리 실패:", processingError)
        setPreviewImage(dataUrl)
        setValue("imageUrl", dataUrl)
      } finally {
        setIsProcessingImage(false)
      }
    },
    [setValue]
  )

  useEffect(() => {
    if (!originalImage) return
    void generatePreview(originalImage, watermarkEnabled)
  }, [originalImage, watermarkEnabled, generatePreview])

  const handleImageChange = async (fileList: FileList | null) => {
    const file = fileList?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.")
      return
    }
    try {
      const dataUrl = await fileToDataUrl(file)
      setOriginalImage(dataUrl)
      await generatePreview(dataUrl, watermarkEnabled)
      setError("")
    } catch (imageError) {
      console.error("이미지 업로드 실패:", imageError)
      setError("이미지를 처리하는 중 문제가 발생했습니다.")
    }
  }

  const toggleWatermark = () => {
    setWatermarkEnabled(prev => !prev)
  }

  const remainingCharacters = useMemo(() => {
    if (!contentValue) return MAX_CONTENT_LENGTH
    return Math.max(0, MAX_CONTENT_LENGTH - contentValue.length)
  }, [contentValue])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-sm text-gray-500">세션 정보를 불러오는 중입니다...</span>
      </div>
    )
  }

  const onSubmit = async (values: ReviewForm) => {
    setError("")
    setSuccessMessage("")
    setIsSubmitting(true)

    try {
      const payload = {
        platform: values.platform,
        business: values.businessName.trim(),
        author: values.customerName.trim() || "익명",
        content: values.content.trim(),
        reviewDate: values.reviewDate,
        originalUrl: values.originalUrl?.trim() || undefined,
        imageUrl: values.imageUrl || previewImage || undefined,
        verifiedBy: values.platform === "Re:cord" ? "manual" : undefined
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const detail = await response.json().catch(() => null)
        throw new Error(detail?.message || "리뷰 저장에 실패했습니다.")
      }

      setSuccessMessage("리뷰가 성공적으로 저장되었습니다.")
      reset()
      setOriginalImage(null)
      setPreviewImage(null)
      setTimeout(() => {
        router.push("/dashboard/reviews")
      }, 600)
    } catch (submitError) {
      console.error("리뷰 저장 오류:", submitError)
      if (submitError instanceof Error) {
        setError(submitError.message)
      } else {
        setError("알 수 없는 오류가 발생했습니다.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">리뷰 아카이빙</h1>
        <p className="text-gray-600">
          고객이 남긴 리뷰를 빠르게 기록하고 보관하세요. Re:cord는 다양한 채널의 리뷰를 한곳에서 관리합니다.
        </p>
      </div>

      <SoftCard className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem>
              <FormLabel>리뷰 출처</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map(platform => {
                  const isSelected = platform.value === watch("platform")
                  return (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => setValue("platform", platform.value)}
                      className={`rounded-md border px-3 py-2 text-sm transition ${
                        isSelected
                          ? "border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]"
                          : "border-gray-200 text-gray-700 hover:border-[#FF6B35]"
                      }`}
                    >
                      {platform.label}
                    </button>
                  )
                })}
              </div>
              {errors.platform && <FormMessage>{errors.platform.message}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel>업체명</FormLabel>
              <Input
                placeholder="예: 레코드 플래그십 스튜디오"
                {...register("businessName", { required: "업체명을 입력해 주세요." })}
              />
              {errors.businessName && <FormMessage>{errors.businessName.message}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel>고객 이름</FormLabel>
              <Input
                placeholder="고객 이름 또는 닉네임"
                {...register("customerName")}
              />
            </FormItem>

            <FormItem>
              <FormLabel>리뷰 작성일</FormLabel>
              <Input
                type="date"
                {...register("reviewDate", { required: "리뷰 작성일을 입력해 주세요." })}
              />
              {futureDateWarning && (
                <p className="mt-1 text-xs text-orange-600">{futureDateWarning}</p>
              )}
              {errors.reviewDate && <FormMessage>{errors.reviewDate.message}</FormMessage>}
            </FormItem>
          </div>

          <FormItem>
            <FormLabel>리뷰 내용</FormLabel>
            <Textarea
              rows={8}
              maxLength={MAX_CONTENT_LENGTH}
              placeholder="고객이 남긴 리뷰 내용을 입력해 주세요."
              {...register("content", {
                required: "리뷰 내용을 입력해 주세요.",
                minLength: { value: 10, message: "리뷰 내용은 최소 10자 이상이어야 합니다." }
              })}
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>{remainingCharacters}자 남았습니다</span>
              {errors.content && <FormMessage>{errors.content.message}</FormMessage>}
            </div>
          </FormItem>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem>
              <FormLabel>관련 링크 (선택)</FormLabel>
              <Input
                placeholder="리뷰가 올라간 원본 링크가 있다면 입력해 주세요."
                {...register("originalUrl")}
              />
            </FormItem>

              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  리뷰 이미지 (선택)
                  <span className="text-xs text-gray-500">
                    {watermarkEnabled ? "워터마크 적용됨" : "워터마크 해제"}
                  </span>
                </FormLabel>
                <div className="space-y-3">
                  <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-center text-sm text-gray-500 hover:border-[#FF6B35] hover:text-[#FF6B35]">
                    <UploadIcon className="mb-2 h-5 w-5" />
                    <span>이미지 업로드</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleImageChange(event.target.files)}
                    />
                  </label>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Button
                      type="button"
                      variant={watermarkEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={toggleWatermark}
                    >
                      {watermarkEnabled ? <CheckIcon className="mr-1 h-3 w-3" /> : null}
                      워터마크 {watermarkEnabled ? "유지" : "적용"}
                    </Button>
                    {isProcessingImage && (
                      <span className="flex items-center text-xs text-gray-500">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" /> 이미지 준비 중
                      </span>
                    )}
                  </div>
                  {previewImage && (
                    <div className="relative overflow-hidden rounded-lg border border-gray-200">
                      <Image
                        src={previewImage}
                        alt="리뷰 이미지 미리보기"
                        width={800}
                        height={600}
                        className="h-full w-full max-h-64 object-cover"
                      />
                    </div>
                  )}
                </div>
                <input type="hidden" {...register("imageUrl")} />
              </FormItem>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset()
                setOriginalImage(null)
                setPreviewImage(null)
                setError("")
                setSuccessMessage("")
              }}
            >
              초기화
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                "리뷰 저장"
              )}
            </Button>
          </div>
        </form>
      </SoftCard>
    </div>
  )
}
