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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import SoftCard from "@/components/ui/soft-card"
import BenefitMeter from "@/components/ui/benefit-meter"
import SavedFeed from "@/components/ui/saved-feed"
import ActionsDock from "@/components/ui/actions-dock"

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
  const [useNormalized, setUseNormalized] = useState(true)
  const [ocrRawText, setOcrRawText] = useState<string>("")
  const [ocrNormalizedText, setOcrNormalizedText] = useState<string>("")
  const [normalizeLevel, setNormalizeLevel] = useState<'off'|'normal'|'strong'>('normal')
  
  // 새로운 UX 개선 상태
  const [showPreview, setShowPreview] = useState(false)
  // Disable auto‑save by default per request
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  type BatchStatus = 'queued'|'processing'|'done'|'error'|'saved'
  type BatchItem = {
    id: string
    file: File
    previewUrl: string
    status: BatchStatus
    confidence?: number
    mock?: boolean
    error?: string
    form: Partial<ReviewForm>
  }
  const [batchItems, setBatchItems] = useState<BatchItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [concurrency] = useState(4)
  const [successMessage, setSuccessMessage] = useState("")
  // Recently-saved feed for visual confirmation after save
  const [savedFeed, setSavedFeed] = useState<Array<{
    id: string
    previewUrl: string
    platform: string
    rating: number
    author: string
    reviewDate: string
    businessName: string
    content: string
  }>>([])
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null)
  const [isQuickMode, setIsQuickMode] = useState(false)
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  // Simple 3-step wizard state: upload -> recognize -> confirm
  const [step, setStep] = useState<'upload'|'recognize'|'confirm'>("upload")

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

  // Sync currently selected batch item's recognized form into the visible form
  const syncFormFromSelected = () => {
    const sel = selectedIndex >= 0 ? batchItems[selectedIndex] : undefined
    if (!sel || !sel.form) return
    const f = sel.form
    if (f.platform) setValue('platform', f.platform)
    if (f.businessName) setValue('businessName', f.businessName)
    if (f.customerName) setValue('customerName', f.customerName)
    if (f.reviewDate) setValue('reviewDate', f.reviewDate)
    if (typeof f.rating !== 'undefined') setValue('rating', String(f.rating))
    if (f.content) setValue('content', f.content)
    if (sel.confidence) setOcrConfidence(Math.round((sel.confidence as number) * 100))
  }

  useEffect(() => {
    syncFormFromSelected()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, JSON.stringify(batchItems.map(b => ({ id: b.id, form: b.form, status: b.status })))])

  // Client-side normalization (safe for Korean):
  // - Keep natural word spaces
  // - Only collapse spaces between Hangul letters when the line mostly consists of single-letter tokens (OCR artifact)
  function applyClientNormalization(text: string, level: 'off'|'normal'|'strong'): string {
    if (!text) return text
    if (level === 'off') return text
    const lines = text.replace(/\r\n?/g, '\n').replace(/[\u200B-\u200D\uFEFF]/g, '').split('\n')
    const hangul = /[\uAC00-\uD7AF]/
    const out: string[] = []
    for (const line of lines) {
      const tokens = line.split(/\s+/).filter(t => t.length>0)
      const singleHangul = tokens.filter(t => t.length === 1 && hangul.test(t)).length
      const ratio = tokens.length ? singleHangul / tokens.length : 0
      let cleaned = line
      // punctuation spacing
      cleaned = cleaned
        .replace(/\s+([,\.\!\?%\)\]\}])/g, '$1')
        .replace(/([\(\[\{])\s+/g, '$1')
      if (ratio >= 0.6) {
        // Likely "자 유 로 처 럼" 케이스: collapse all spaces between Hangul letters only
        cleaned = cleaned.replace(/(?<=[\uAC00-\uD7AF])\s+(?=[\uAC00-\uD7AF])/g, '')
      } else {
        // Preserve word boundaries; just normalize multi-spaces
        cleaned = cleaned.replace(/ {2,}/g, ' ')
      }
      out.push(cleaned)
    }
    let s = out.join('\n')
    if (level === 'strong') {
      s = s.split('\n')
        .filter(l => !/^(\?|x|X|☆|★|\*|\-|=|—|·|ㆍ)$/.test(l.trim()))
        .join('\n')
    }
    return s
  }

  const DRAFT_KEY = 'review-draft-v2'
  const LEGACY_DRAFT_KEY = 'review-draft'

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled) return
    
    const saveTimer = setTimeout(() => {
      const values = getValues()
      if (values.businessName || values.content || values.customerName) {
        try {
          const payload = { ...values, _savedAt: Date.now() }
          localStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
        } catch {}
        setLastSaved(new Date())
      }
    }, 2000)

    return () => clearTimeout(saveTimer)
  }, [formValues, autoSaveEnabled, getValues])

  // Load saved draft on mount (only when auto‑save enabled)
  useEffect(() => {
    if (!autoSaveEnabled) return
    try {
      const current = localStorage.getItem(DRAFT_KEY)
      const legacy = !current && localStorage.getItem(LEGACY_DRAFT_KEY)
      const toUse = current || legacy
      if (toUse) {
        const draft = JSON.parse(toUse)
        // Only auto-load if created within last 7 days
        const fresh = !draft._savedAt || (Date.now() - draft._savedAt < 7*24*60*60*1000)
        if (fresh) {
          Object.keys(draft).forEach(key => {
            if (key.startsWith('_')) return
            setValue(key as keyof ReviewForm, draft[key])
          })
          setSuccessMessage("이전 자동저장을 불러왔습니다")
          setTimeout(() => setSuccessMessage(""), 3000)
          // Migrate legacy key to v2
          if (!current) {
            localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, _savedAt: Date.now() }))
            localStorage.removeItem(LEGACY_DRAFT_KEY)
          }
        } else {
          localStorage.removeItem(DRAFT_KEY)
          localStorage.removeItem(LEGACY_DRAFT_KEY)
        }
      }
    } catch (e) {
      console.error('Failed to load draft:', e)
    }
  }, [autoSaveEnabled, setValue])

  // Step progression helpers
  useEffect(() => {
    if (uploadedImage && step === 'upload') setStep('recognize')
  }, [uploadedImage, step])

  // Move to recognize when batch queued; bind preview to selection; kick OCR
  useEffect(() => {
    if (batchItems.length > 0) {
      if (selectedIndex === -1) setSelectedIndex(0)
      const sel = batchItems[selectedIndex] || batchItems[0]
      if (sel && !uploadedImage) setUploadedImage(sel.previewUrl)
      if (step === 'upload') setStep('recognize')
      // start OCR if any queued
      scheduleOcr()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchItems.length])

  const minimalValid = () => {
    const v = getValues()
    return Boolean(v.platform && v.reviewDate && v.rating && (v.content && v.content.trim().length >= 10))
  }

  const selectedHasParsed = () => {
    const sel = selectedIndex >= 0 ? batchItems[selectedIndex] : undefined
    const f: any = sel?.form || {}
    return Boolean((f.content && f.content.trim().length >= 5) || f.platform || f.businessName || f.customerName || f.rating)
  }

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
      if (!isBatch) {
        setTimeout(() => handleOCRExtract(), 300)
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
    if (files.length > 0) await enqueueFiles(files)
  }
  
  const handleNextBatchFile = async () => {
    // Legacy navigation support: select next processed/queued item
    if (batchItems.length > 0) {
      const next = Math.min(selectedIndex + 1, batchItems.length - 1)
      setSelectedIndex(next)
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSkipCurrent = async () => {
    // Clear OCR state and move to next without saving
    setOcrResult(null)
    setOcrConfidence(null)
    setUploadedFile(null)
    setUploadedImage(null)
    setWatermarkedImage(null)
    setValue('content', '')
    setValue('customerName', '')
    setValue('originalUrl', '')
    // keep platform/business if 원하는 경우 유지, 여기서는 그대로 둠
    await handleNextBatchFile()
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
      const currentItem = selectedIndex >= 0 ? batchItems[selectedIndex] : undefined
      const imageSrc = watermarkEnabled && watermarkedImage
        ? (watermarkedImage as string)
        : (uploadedImage || currentItem?.previewUrl)

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
          imageUrl: imageSrc,
          originalUrl: data.originalUrl,
          verifiedBy: uploadedImage ? 'screenshot' : data.originalUrl ? 'manual' : null,
          ocrConfidence: ocrConfidence // OCR 신뢰도 저장
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || errorData.error || "리뷰 추가에 실패했습니다.")
      }

      // 성공 시 로컬 스토리지 초기화 (v1/v2 모두 제거)
      try {
        localStorage.removeItem('review-draft')
        localStorage.removeItem('review-draft-v2')
      } catch {}
      
      // 성공 메시지 표시
      setSuccessMessage("리뷰가 성공적으로 추가되었습니다!")
      // Feed에 추가(시각적 확신)
      setSavedFeed(prev => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          previewUrl: imageSrc || '',
          platform: data.platform,
          rating: parseInt(data.rating.toString()),
          author: data.customerName,
          reviewDate: data.reviewDate,
          businessName: data.businessName,
          content: data.content,
        },
        ...prev,
      ])
      
      // 배치 모드 처리
      if (batchItems.length > 0 && selectedIndex < batchItems.length - 1) {
        // 현재 아이템을 저장됨 상태로 표시
        setBatchItems(prev => prev.map((it, idx) => idx===selectedIndex ? { ...it, status: 'saved' } : it))
        // 다음 아이템 자동 선택
        const next = Math.min(selectedIndex + 1, batchItems.length - 1)
        setSelectedIndex(next)
        // 폼에 다음 아이템 내용 반영
        const nextItem = batchItems[next]
        if (nextItem) {
          const f = nextItem.form
          if (f.platform) setValue('platform', f.platform)
          if (f.businessName) setValue('businessName', f.businessName)
          if (f.customerName) setValue('customerName', f.customerName)
          if (f.reviewDate) setValue('reviewDate', f.reviewDate)
          if (f.rating) setValue('rating', f.rating.toString())
          if (f.content) setValue('content', f.content)
          setUploadedImage(nextItem.previewUrl)
          if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
        }
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
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return
    await enqueueFiles(files)
  }

  const enqueueFiles = async (files: File[]) => {
    // create batch items with previews
    const items: BatchItem[] = []
    for (const f of files) {
      const url = URL.createObjectURL(f)
      items.push({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2)}`, file: f, previewUrl: url, status: 'queued', form: {} })
    }
    setBatchItems(prev => {
      const merged = [...prev, ...items]
      if (merged.length > 0 && selectedIndex === -1) setSelectedIndex(0)
      return merged
    })
    setSuccessMessage(`${files.length}개 이미지가 추가되었습니다.`)
    scheduleOcr()
  }

  // Process queued items with limited concurrency
  const scheduleOcr = () => {
    setBatchItems(prev => {
      const running = prev.filter(i => i.status === 'processing').length
      if (running >= concurrency) return prev
      const toStart = concurrency - running
      const updated = [...prev]
      for (let i = 0; i < updated.length && updated.filter(x=>x.status==='processing').length < concurrency; i++) {
        const it = updated[i]
        if (it.status === 'queued') {
          it.status = 'processing'
          // fire and forget
          processBatchItem(it).catch(()=>{})
        }
      }
      return updated
    })
  }

  const processBatchItem = async (item: BatchItem) => {
    try {
      // Reuse existing validation from processImageFile
      if (!item.file.type.startsWith('image/')) throw new Error('이미지 파일만 업로드할 수 있습니다')
      if (item.file.size > 10 * 1024 * 1024) throw new Error('파일 크기는 10MB 이하여야 합니다')
      // prepare formData
      const fd = new FormData()
      fd.append('image', item.file)
      const res = await fetch('/api/ocr', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json().catch(()=>({}))
        throw new Error(err.error || '텍스트 추출 실패')
      }
      const data = await res.json()
      const d = data.data || {}
      // Map to form
      const formUpd: Partial<ReviewForm> = {}
      if (d.platform) {
        const matched = platforms.find(p => p.value.includes(d.platform) || d.platform.includes(p.value))
        formUpd.platform = matched ? matched.value : formValues.platform
      }
      if (d.business) formUpd.businessName = d.business
      if (d.author) formUpd.customerName = d.author
      if (d.date) formUpd.reviewDate = d.date
      if (d.rating) formUpd.rating = d.rating
      const base = useNormalized ? (d.reviewText || d.normalizedText || d.text) : (d.rawText || d.text)
      formUpd.content = applyClientNormalization(base || '', normalizeLevel)

      setBatchItems(prev => prev.map(it => it.id === item.id ? ({ ...it, status: 'done', confidence: d.confidence, mock: d.mock, form: { ...it.form, ...formUpd } }) : it))
      // If this is the selected one, push into form UI
      if (selectedIndex >= 0) {
        const idx = batchItems.findIndex(it => it.id === item.id)
        if (idx === selectedIndex) {
          if (formUpd.platform) setValue('platform', formUpd.platform)
          if (formUpd.businessName) setValue('businessName', formUpd.businessName)
          if (formUpd.customerName) setValue('customerName', formUpd.customerName)
          if (formUpd.reviewDate) setValue('reviewDate', formUpd.reviewDate)
          if (formUpd.rating) setValue('rating', formUpd.rating.toString())
          if (formUpd.content) setValue('content', formUpd.content)
          if (d.confidence) setOcrConfidence(Math.round((d.confidence as number) * 100))
        }
      }
    } catch (e:any) {
      setBatchItems(prev => prev.map(it => it.id === item.id ? ({ ...it, status: 'error', error: e.message || '오류' }) : it))
    } finally {
      // schedule next if queue remains
      scheduleOcr()
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
          ) || (platform === 'naver' ? platforms.find(p => p.value === '네이버')
              : platform === 'kakao' ? platforms.find(p => p.value === '카카오맵')
              : platform === 'google' ? platforms.find(p => p.value === '구글')
              : undefined)
          if (matchedPlatform) {
            setValue("platform", matchedPlatform.value)
            fieldsUpdated++
            setAutoFilled(prev=>({...prev, platform:true}))
          }
        }
        
        // 비즈니스명 설정
        if (business && business.trim()) {
          setValue("businessName", business.trim())
          fieldsUpdated++
          setAutoFilled(prev=>({...prev, business:true}))
        }
        
        // 평점 설정
        if (rating && rating >= 1 && rating <= 5) {
          setValue("rating", rating.toString())
          fieldsUpdated++
          setAutoFilled(prev=>({...prev, rating:true}))
        }
        
        // 작성자명 설정
        if (author && author.trim()) {
          setValue("customerName", author.trim())
          fieldsUpdated++
          setAutoFilled(prev=>({...prev, author:true}))
        }
        
        // 날짜 설정
        if (reviewDate && reviewDate.trim()) {
          setValue("reviewDate", reviewDate)
          fieldsUpdated++
          setAutoFilled(prev=>({...prev, date:true}))
        }
        
        // 리뷰 내용 설정
        if (content && content.trim() && content.length >= 5) {
          setValue("content", content.trim())
          fieldsUpdated++
          setAutoFilled(prev=>({...prev, content:true}))
        }
      } else if (data.success && data.data) {
        const d = data.data
        // 플랫폼
        if (d.platform) {
          const matched = platforms.find(p => p.value.includes(d.platform) || d.platform.includes(p.value))
            || (d.platform === 'naver' ? platforms.find(p => p.value === '네이버')
                : d.platform === 'kakao' ? platforms.find(p => p.value === '카카오맵')
                : d.platform === 'google' ? platforms.find(p => p.value === '구글')
                : undefined)
          if (matched) { setValue("platform", matched.value); fieldsUpdated++; setAutoFilled(prev=>({...prev, platform:true})) }
        }
        // 작성자
        if (d.author) { setValue("customerName", d.author); fieldsUpdated++; setAutoFilled(prev=>({...prev, author:true})) }
        // 업체명(가능한 경우)
        if (d.business) { setValue("businessName", d.business); fieldsUpdated++; setAutoFilled(prev=>({...prev, business:true})) }
        // 날짜
        if (d.date) { setValue("reviewDate", d.date); fieldsUpdated++; setAutoFilled(prev=>({...prev, date:true})) }
        // 평점
        if (d.rating && d.rating >= 1 && d.rating <= 5) { setValue("rating", d.rating.toString()); fieldsUpdated++; setAutoFilled(prev=>({...prev, rating:true})) }
        // 내용
        setOcrRawText(d.rawText || d.text || "")
        setOcrNormalizedText(d.reviewText || d.normalizedText || d.text || "")
        const base = (useNormalized ? (d.reviewText || d.normalizedText) : (d.rawText || d.text)) || d.text
        const body = applyClientNormalization(base, normalizeLevel)
        if (body && body.trim().length >= 5) { setValue("content", body.trim()); fieldsUpdated++; setAutoFilled(prev=>({...prev, content:true})) }
        if (d.engine) setOcrEngine(d.engine)
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
        const rawConfidence = (data.data?.confidence ?? data.confidence ?? 0.95)
        const confidence = Math.round(rawConfidence * 100)
        setOcrConfidence(confidence)
        
        const isMock = Boolean(data.mock || data.data?.mock)
        const message = isMock 
          ? `테스트 모드: 샘플 데이터가 입력되었습니다.
 Google Vision API를 설정하면 실제 OCR이 작동합니다.`
          : `${fieldsUpdated}개 필드가 자동으로 입력되었습니다!`
        
        setSuccessMessage(message)
        setTimeout(() => setSuccessMessage(""), 5000)
        // mark recognized when we have updates
        try { (window as any).__recognized__ = true } catch {}
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
      // Move to confirm step only if recognized succeeded
      const ok = (typeof window !== 'undefined') ? Boolean((window as any).__recognized__) : true
      if (typeof window !== 'undefined') { try { delete (window as any).__recognized__ } catch {} }
      setStep(prev => ((ok && prev === 'recognize') ? 'confirm' : prev))
    }
  }

  // --- Single panel wizard early-return UI ---
  // Keeps legacy layout below for reference but not used
  if (true) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <SoftCard>
            {/* Stepper */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">새 리뷰 추가</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full ${step==='upload'?'bg-orange-100 text-orange-700':'bg-gray-100 text-gray-600'}`}>1 업로드</span>
                <span className={`px-2 py-1 rounded-full ${step==='recognize'?'bg-orange-100 text-orange-700':'bg-gray-100 text-gray-600'}`}>2 인식</span>
                <span className={`px-2 py-1 rounded-full ${step==='confirm'?'bg-orange-100 text-orange-700':'bg-gray-100 text-gray-600'}`}>3 확인·저장</span>
              </div>
            </div>

            {/* Panel content */}
            {step === 'upload' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">이미지를 업로드하면 자동으로 텍스트를 채워드려요.</p>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-10 text-center ${isDragOver? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  {!uploadedImage ? (
                    <>
                      <p className="text-sm text-gray-600 mb-2">이미지를 끌어다 놓거나 클릭하여 선택하세요</p>
                      <p className="text-xs text-gray-500">JPG, PNG, WebP / 최대 10MB</p>
                      <div className="mt-4">
                        <label className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-400 cursor-pointer">
                          <input type="file" accept="image/*" multiple className="hidden" onChange={(e)=>{ const files = Array.from(e.target.files || []); if (files.length) enqueueFiles(files) }} />
                          <UploadIcon /> 이미지 선택
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="relative">
                      <img src={watermarkEnabled && watermarkedImage ? watermarkedImage : uploadedImage} className="max-h-[420px] w-full object-contain rounded-lg border" alt="preview" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 'recognize' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">이미지에서 텍스트를 인식하는 중입니다. 잠시만 기다려주세요.</p>
                {/* Overall progress */}
                <div className="rounded-lg border bg-white p-4">
                  {(() => {
                    const done = batchItems.filter(b => b.status==='done' || b.status==='error').length
                    const total = Math.max(1, batchItems.length)
                    const pct = Math.round((done/total)*100)
                    return (
                      <>
                        <div className="h-2 w-full rounded-full bg-orange-50 overflow-hidden">
                          <div className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-400" style={{width: `${pct}%`}}></div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">{done}/{total} 인식 완료</div>
                      </>
                    )
                  })()}
                </div>
                {/* Engine and autofill chips */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {ocrEngine && (
                    <span className="px-2 py-1 rounded-full border text-gray-700 bg-gray-50">엔진: {ocrEngine}</span>
                  )}
                  {ocrConfidence !== null && (
                    <span className="px-2 py-1 rounded-full border text-gray-700 bg-gray-50">신뢰도: {ocrConfidence}%</span>
                  )}
                  {(autoFilled.platform||autoFilled.date||autoFilled.rating||autoFilled.business||autoFilled.author||autoFilled.content) && (
                    <>
                      {autoFilled.platform && <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border">플랫폼✓</span>}
                      {autoFilled.date && <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border">날짜✓</span>}
                      {autoFilled.rating && <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border">평점✓</span>}
                      {autoFilled.business && <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border">업체명✓</span>}
                      {autoFilled.author && <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border">작성자✓</span>}
                      {autoFilled.content && <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border">내용✓</span>}
                    </>
                  )}
                </div>
                {/* Thumbnail strip */}
                {batchItems.length>0 && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {batchItems.map((it, idx) => (
                      <button key={it.id} onClick={()=>{setSelectedIndex(idx); setUploadedImage(it.previewUrl)}} className={`min-w-20 h-20 rounded-md border overflow-hidden relative ${selectedIndex===idx?'ring-2 ring-orange-400':''}`} title={it.status}>
                        <img src={it.previewUrl} alt="thumb" className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/90 border">{idx+1}</span>
                        <span className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/90 border">
                          {it.status==='done'?'완료':it.status==='processing'?'인식중':it.status==='error'?'오류':'대기'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {/* Large preview of selected */}
                {selectedIndex>=0 && batchItems[selectedIndex] && (
                  <img src={batchItems[selectedIndex].previewUrl} className="max-h-[320px] w-full object-contain rounded-lg border" alt="selected" />
                )}
              </div>
            )}

              {step === 'confirm' && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-sm text-gray-600">자동 채움 결과를 확인하고 필요한 부분만 수정하세요. 위의 카드에서 이미지를 바꾸면 해당 결과가 즉시 반영됩니다.</p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {ocrEngine && (
                    <span className="px-2 py-1 rounded-full border text-gray-700 bg-gray-50">엔진: {ocrEngine}</span>
                  )}
                  {ocrConfidence !== null && (
                    <span className="px-2 py-1 rounded-full border text-gray-700 bg-gray-50">신뢰도: {ocrConfidence}%</span>
                  )}
                  {(autoFilled.platform||autoFilled.date||autoFilled.rating||autoFilled.business||autoFilled.author||autoFilled.content) && (
                    <>
                      <span className="text-gray-500 mr-1">자동 채움됨:</span>
                      {autoFilled.platform && <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border">플랫폼</span>}
                      {autoFilled.date && <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border">날짜</span>}
                      {autoFilled.rating && <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border">평점</span>}
                      {autoFilled.business && <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border">업체명</span>}
                      {autoFilled.author && <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border">작성자</span>}
                      {autoFilled.content && <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border">내용</span>}
                    </>
                  )}
                </div>

                {/* Thumbnail strip in confirm step */}
                {batchItems.length>0 && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {batchItems.map((it, idx) => (
                      <button key={it.id} onClick={(e)=>{e.preventDefault(); setSelectedIndex(idx); setUploadedImage(it.previewUrl); syncFormFromSelected(); }} className={`min-w-20 h-20 rounded-md border overflow-hidden relative ${selectedIndex===idx?'ring-2 ring-orange-400':''}`} title={it.status}>
                        <img src={it.previewUrl} alt="thumb" className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/90 border">{idx+1}</span>
                        <span className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/90 border">
                          {it.status==='done'?'완료':it.status==='processing'?'인식중':it.status==='error'?'오류':'대기'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected image preview (small) */}
                {selectedIndex>=0 && batchItems[selectedIndex] && (
                  <img src={batchItems[selectedIndex].previewUrl} className="max-h-[220px] w-full object-contain rounded-lg border" alt="selected" />
                )}
              {/* 원문/정리본 + 보정 강도 */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border overflow-hidden">
                  <button type="button" onClick={() => { setUseNormalized(true); if (ocrNormalizedText) setValue('content', applyClientNormalization(ocrNormalizedText, normalizeLevel)) }} className={`px-3 py-1 text-sm ${useNormalized?'bg-orange-50 text-orange-700':'text-gray-600'}`}>정리본</button>
                  <button type="button" onClick={() => { setUseNormalized(false); if (ocrRawText) setValue('content', applyClientNormalization(ocrRawText, normalizeLevel)) }} className={`px-3 py-1 text-sm ${!useNormalized?'bg-orange-50 text-orange-700':'text-gray-600'}`}>원문</button>
                </div>
                <div className="inline-flex rounded-lg border overflow-hidden">
                  {(['off','normal','strong'] as const).map(lvl => (
                    <button key={lvl} type="button" onClick={() => { setNormalizeLevel(lvl); const base = useNormalized ? (ocrNormalizedText || ocrRawText) : ocrRawText; if (base) setValue('content', applyClientNormalization(base, lvl)) }} className={`px-3 py-1 text-sm ${normalizeLevel===lvl?'bg-gray-100 text-gray-800':'text-gray-600'}`}>{lvl==='off'?'보정 끔':lvl==='normal'?'보정 기본':'보정 강함'}</button>
                  ))}
                </div>
              </div>

              {/* 필수 최소 필드 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FormLabel>플랫폼</FormLabel>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {['네이버','카카오맵','구글','크몽','인스타그램','기타'].map(p => (
                        <label key={p} className={`px-2 py-1 text-xs rounded-full border cursor-pointer ${selectedPlatform===p? 'border-orange-400 bg-orange-50 text-orange-700':'border-gray-200 text-gray-700'}`}>
                          <input type="radio" className="sr-only" value={p} {...register('platform', { required: '플랫폼을 선택해주세요' })} />
                          {p}
                        </label>
                      ))}
                    </div>
                    {errors.platform && <FormMessage>{errors.platform.message}</FormMessage>}
                  </div>
                  <div>
                    <FormLabel>평점</FormLabel>
                    <select className="mt-1 w-full border rounded-md p-2" {...register('rating', { required: '평점을 선택하세요' })}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} 점</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FormLabel>업체명</FormLabel>
                    <Input {...register('businessName', { required: '업체명을 입력하세요' })} placeholder="업체명을 입력" />
                  </div>
                  <div>
                    <FormLabel>작성자</FormLabel>
                    <Input {...register('customerName', { required: '작성자를 입력하세요' })} placeholder="예: 김**" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FormLabel>작성일</FormLabel>
                    <Input type="date" {...register('reviewDate', { required: '작성일을 입력하세요' })} />
                  </div>
                  <div>
                    <FormLabel>원본 링크(선택)</FormLabel>
                    <Input {...register('originalUrl')} placeholder="https://" />
                  </div>
                </div>
                <div>
                  <FormLabel>리뷰 내용</FormLabel>
                  <textarea className="mt-1 w-full border rounded-md p-3 min-h-36" {...register('content', { required: '리뷰 내용을 입력하세요', minLength: { value: 10, message: '최소 10자 이상' } })} placeholder="리뷰 내용을 입력해주세요..." />
                  {errors.content && <FormMessage>{errors.content.message}</FormMessage>}
                </div>
                {/* Summary of what will be saved */}
                <SoftCard className="border-orange-100" title="저장될 내용 미리보기">
                  {(() => {
                    const v = getValues()
                    return (
                      <div className="text-sm text-gray-700 space-y-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div><span className="text-gray-500">플랫폼</span><div className="font-medium">{v.platform || '-'}</div></div>
                          <div><span className="text-gray-500">평점</span><div className="font-medium">{v.rating || '-'}</div></div>
                          <div><span className="text-gray-500">업체명</span><div className="font-medium">{v.businessName || '-'}</div></div>
                          <div><span className="text-gray-500">작성자</span><div className="font-medium">{v.customerName || '-'}</div></div>
                          <div><span className="text-gray-500">작성일</span><div className="font-medium">{v.reviewDate || '-'}</div></div>
                        </div>
                        <div className="mt-2">
                          <div className="text-gray-500 mb-1">리뷰 내용</div>
                          <div className="p-3 border rounded-md bg-gray-50 whitespace-pre-wrap text-gray-800 min-h-[96px]">{(v.content && v.content.trim()) || '내용 없음'}</div>
                        </div>
                      </div>
                    )
                  })()}
                </SoftCard>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-[#FF6B35] hover:bg-[#E55A2B]">저장</Button>
                </div>
              </form>
            )}
          </SoftCard>

          <div className="mt-4">
            <ActionsDock
              step={step as any}
              onBack={() => setStep(step === 'confirm' ? 'recognize' : 'upload')}
              onNext={() => {
                if (step === 'upload') setStep('recognize')
                else if (step === 'recognize') { syncFormFromSelected(); setStep('confirm') }
              }}
              onSave={handleSubmit(onSubmit)}
              nextDisabled={(step==='upload' && !uploadedImage) || (step==='recognize' && (isExtracting || !selectedHasParsed()))}
              saveDisabled={!minimalValid() || isLoading}
            />
          </div>
        </div>
      </div>
    )
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
            {autoSaveEnabled && lastSaved && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CheckIcon className="w-3 h-3 text-green-500" />
                자동 저장됨 ({new Date(lastSaved).toLocaleTimeString()})
              </div>
            )}
            {autoSaveEnabled && (
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('review-draft-v2');
                  localStorage.removeItem('review-draft');
                  setSuccessMessage('자동저장을 비웠습니다');
                  setTimeout(()=>setSuccessMessage(''), 3000)
                } catch {}
              }}
              className="text-xs text-gray-500 hover:text-gray-800 underline"
              title="이전 자동저장 데이터를 비웁니다"
            >
              자동저장 비우기
            </button>) }
            
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
            {batchItems.length > 0 && selectedIndex >= 0 && (
              <Badge className="bg-purple-600">
                배치: {selectedIndex + 1}/{batchItems.length}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
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

          {/* New compact top section: Upload/Preview + Benefits */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SoftCard title="이미지 업로드" description="이미지를 업로드하면 자동으로 채워드려요">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center ${isDragOver? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  {!uploadedImage ? (
                    <>
                      <p className="text-sm text-gray-600 mb-2">이미지를 끌어다 놓거나 클릭하여 선택하세요</p>
                      <p className="text-xs text-gray-500">JPG, PNG, WebP / 최대 10MB</p>
                      <div className="mt-4">
                        <label className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-400 cursor-pointer">
                          <input type="file" accept="image/*" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) processImageFile(f,false)}} />
                          <UploadIcon /> 이미지 선택
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="relative">
                      <img src={watermarkEnabled && watermarkedImage ? watermarkedImage : uploadedImage} className="max-h-[420px] w-full object-contain rounded-lg border" alt="preview" />
                    </div>
                  )}
                </div>
              </SoftCard>
            </div>
            <div className="lg:col-span-1">
              <SoftCard title="나의 이득" description="저장할수록 신뢰가 쌓여요">
                <BenefitMeter
                  totalReviews={savedFeed.length}
                  trustScore={Math.min(100, (ocrConfidence ?? 60))}
                  completeness={Math.min(100, 40 + Math.min(savedFeed.length * 6, 60))}
                />
                <div className="mt-6">
                  <p className="text-xs text-gray-500 mb-2">방금 추가된 리뷰</p>
                  <SavedFeed items={savedFeed} />
                </div>
              </SoftCard>
            </div>
          </div>
        
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  {(uploadedImage || (selectedIndex>=0 && batchItems[selectedIndex])) ? (
                    <div className="space-y-4">
                      <div className="relative group">
                        <Dialog open={imagePreviewOpen} onOpenChange={(o)=>{ setImagePreviewOpen(o); if(!o) setZoom(1); }}>
                          <img 
                            src={watermarkEnabled && watermarkedImage ? watermarkedImage : (uploadedImage || batchItems[selectedIndex]?.previewUrl || '')} 
                            alt="Uploaded review" 
                            className="w-full h-48 object-cover rounded-lg cursor-zoom-in"
                            onClick={() => { setImagePreviewOpen(true); setZoom(1); }}
                          />
                          <div className="absolute inset-0 hidden group-hover:flex items-center justify-center rounded-lg bg-black/30 text-white text-xs">
                            클릭하여 확대 보기
                          </div>
                          <DialogContent className="max-w-5xl w-[90vw]" onOpenAutoFocus={(e)=>e.preventDefault()}>
                            <DialogHeader>
                              <DialogTitle>업로드 이미지 미리보기</DialogTitle>
                            </DialogHeader>
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-sm text-gray-500">마우스 휠/트랙패드로 확대·축소, 드래그로 이동</div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>-</Button>
                                <span className="w-16 text-center text-sm">{Math.round(zoom * 100)}%</span>
                                <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.min(3, z + 0.1))}>+</Button>
                                <Button size="sm" variant="ghost" onClick={() => setZoom(1)}>원본</Button>
                              </div>
                            </div>
                            <div 
                              className="relative w-full h-[70vh] overflow-auto rounded-lg bg-black/5 cursor-grab active:cursor-grabbing"
                              onWheel={(e) => {
                                e.preventDefault();
                                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                                setZoom(z => Math.min(3, Math.max(0.5, z + delta)));
                              }}
                            >
                              <div className="min-w-full min-h-full flex items-center justify-center">
                                <img
                                  src={watermarkEnabled && watermarkedImage ? watermarkedImage : (uploadedImage || batchItems[selectedIndex]?.previewUrl || '')}
                                  alt="Preview"
                                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                                  className="select-none pointer-events-none max-w-none"
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
                          multiple
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

          {/* Image Preview Modal */}
          <Dialog open={imagePreviewOpen} onOpenChange={(o) => { setImagePreviewOpen(o); if (!o) setZoom(1); }}>
            <DialogContent className="max-w-5xl w-[90vw]">
              <DialogHeader>
                <DialogTitle>업로드 이미지 미리보기</DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-500">마우스 휠/트랙패드로 확대·축소, 드래그로 이동</div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>-</Button>
                  <span className="w-16 text-center text-sm">{Math.round(zoom * 100)}%</span>
                  <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.min(3, z + 0.1))}>+</Button>
                  <Button size="sm" variant="ghost" onClick={() => setZoom(1)}>원본</Button>
                </div>
              </div>
              <div 
                className="relative w-full h-[70vh] overflow-auto rounded-lg bg-black/5 cursor-grab active:cursor-grabbing"
                onWheel={(e) => {
                  e.preventDefault();
                  const delta = e.deltaY > 0 ? -0.1 : 0.1;
                  setZoom(z => Math.min(3, Math.max(0.5, z + delta)));
                }}
              >
                <div className="min-w-full min-h-full flex items-center justify-center">
                  <img
                    src={watermarkEnabled && watermarkedImage ? watermarkedImage : uploadedImage || ''}
                    alt="Preview"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                    className="select-none pointer-events-none max-w-none"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Batch Grid Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>업로드한 이미지</CardTitle>
              <CardDescription>
                처리 상태를 확인하고 카드를 클릭하여 세부 내용을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              {batchItems.length === 0 ? (
                <div className="text-sm text-gray-500">아직 업로드된 이미지가 없습니다.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {batchItems.map((it, idx) => (
                    <button
                      key={it.id}
                      onClick={() => {
                        setSelectedIndex(idx)
                        // 만약 이미 OCR 결과가 있다면 폼에 반영
                        const f = it.form
                        if (f.platform) setValue('platform', f.platform)
                        if (f.businessName) setValue('businessName', f.businessName)
                        if (f.customerName) setValue('customerName', f.customerName)
                        if (f.reviewDate) setValue('reviewDate', f.reviewDate)
                        if (f.rating) setValue('rating', f.rating.toString())
                        if (f.content) setValue('content', f.content)
                        setUploadedImage(it.previewUrl)
                      }}
                      className={`relative border rounded overflow-hidden text-left ${selectedIndex===idx?'border-[#FF6B35]':'border-gray-200'}`}
                      title={it.status}
                    >
                      <img src={it.previewUrl} alt="preview" className="w-full h-24 object-cover" />
                      <div className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/80 backdrop-blur border">
                        {idx+1}/{batchItems.length}
                      </div>
                      <div className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur border text-white"
                        style={{backgroundColor: it.status==='done'?'#10b981': it.status==='processing'?'#f59e0b': it.status==='error'?'#ef4444':'#6b7280'}}>
                        {it.status==='done'?'완료':it.status==='processing'?'처리중':it.status==='error'?'오류':'대기'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
                  {/* 정리본/원문 탭 & 토글 */}
                  {(ocrRawText || ocrNormalizedText) && (
                    <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
                      <div className="inline-flex gap-1 bg-gray-100 rounded p-1">
                        <button
                          type="button"
                          onClick={() => { setUseNormalized(true); if (ocrNormalizedText) setValue('content', ocrNormalizedText) }}
                          className={`px-2 py-1 rounded ${useNormalized ? 'bg-white text-gray-900 shadow' : ''}`}
                        >정리본</button>
                        <button
                          type="button"
                          onClick={() => { setUseNormalized(false); if (ocrRawText) setValue('content', ocrRawText) }}
                          className={`px-2 py-1 rounded ${!useNormalized ? 'bg-white text-gray-900 shadow' : ''}`}
                        >원문</button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="hidden md:inline">보정 강도</span>
                        <select
                          className="border border-gray-300 rounded px-2 py-1 bg-white"
                          value={normalizeLevel}
                          onChange={(e)=>{
                            const v = e.target.value as 'off'|'normal'|'strong'
                            setNormalizeLevel(v)
                            const current = useNormalized ? (ocrNormalizedText || ocrRawText) : ocrRawText
                            if (current) setValue('content', applyClientNormalization(current, v))
                          }}
                        >
                          <option value="off">끔</option>
                          <option value="normal">기본</option>
                          <option value="strong">강함</option>
                        </select>
                      </div>
                    </div>
                  )}
                  <textarea
                    id="content"
                    rows={10}
                    maxLength={2000}
                    className="w-full p-4 border border-gray-300 rounded-lg resize-y text-base md:text-lg leading-relaxed"
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
                      ) : batchItems.length > 0 && selectedIndex < batchItems.length - 1 ? (
                        <>다음 리뷰 ({selectedIndex + 2}/{batchItems.length})</>
                      ) : (
                        "리뷰 추가"
                      )}
                    </Button>
                    {batchItems.length > 0 && selectedIndex < batchItems.length - 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleSkipCurrent}
                        className="px-4"
                        title="저장하지 않고 다음 이미지로 이동"
                      >
                        건너뛰기
                      </Button>
                    )}
                  </div>
                  
                  {/* 자동 저장 설정 (비활성화됨) */}
                  {false && (
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
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Action Dock (simplified flow helper) */}
      <ActionsDock
        step={step}
        onBack={() => setStep(step === 'confirm' ? 'review' : 'upload')}
        onNext={() => setStep(step === 'upload' ? 'review' : 'confirm')}
        onSave={handleSubmit(onSubmit)}
        nextDisabled={step === 'review' && !minimalValid()}
        saveDisabled={!minimalValid() || isLoading}
      />
    </div>
  )
}
