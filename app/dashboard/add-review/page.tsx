"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { UploadIcon, CheckIcon } from "@radix-ui/react-icons"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form-simple"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { addWatermark } from "@/lib/watermark"
import SoftCard from "@/components/ui/soft-card"

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
  
  // Disable auto‑save by default per request
  const [autoSaveEnabled] = useState(false)
  const [, setLastSaved] = useState<Date | null>(null)
  const [, setUploadProgress] = useState(0)
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
  const [, setSavedFeed] = useState<Array<{
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
  const [isQuickMode] = useState(false)
  // Simple 3-step wizard state: upload -> recognize -> confirm
  const [step, setStep] = useState<'upload'|'recognize'|'confirm'>("upload")
  const [ocrEngine, setOcrEngine] = useState<string | null>(null)
  const [autoFilled, setAutoFilled] = useState<{platform:boolean;business:boolean;author:boolean;date:boolean;rating:boolean;content:boolean}>({
    platform:false, business:false, author:false, date:false, rating:false, content:false
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues
  } = useForm<ReviewForm>()

  const selectedPlatform = watch("platform")
  const selectedRating = watch("rating")
  const formValues = watch()

  const steps = [
    { key: 'upload' as const, title: '이미지 업로드', description: '스크린샷을 추가하세요' },
    { key: 'recognize' as const, title: '자동 인식', description: 'AI가 내용을 추출합니다' },
    { key: 'confirm' as const, title: '확인 · 저장', description: '필드를 검토하고 저장하세요' },
  ]
  const currentStepIndex = Math.max(0, steps.findIndex((s) => s.key === step))
  const totalItems = batchItems.length
  const processedItems = batchItems.filter((b) => ['done', 'error', 'saved'].includes(b.status)).length
  const progressPercent = totalItems === 0 ? 0 : Math.round((processedItems / totalItems) * 100)

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
    // Prefer batch parsed flags
    const sel = selectedIndex >= 0 ? batchItems[selectedIndex] : undefined
    const f: any = sel?.form || {}
    if ((f.content && f.content.trim().length >= 5) || f.platform || f.businessName || f.customerName || f.rating) return true
    // Fallback: if current form already has meaningful values, allow next
    const v = getValues()
    if ((v.content && v.content.trim().length >= 5) || v.platform || v.businessName || v.customerName || v.rating) return true
    // Or if OCR recognized flag set (from handleOCRExtract), allow progression
    try { if (typeof window !== 'undefined' && (window as any).__recognized__) return true } catch {}
    return false
  }

  useEffect(() => {
    if (step === 'recognize' && selectedHasParsed()) {
      setStep('confirm')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedIndex, batchItems, formValues])

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

      const hasUpdates = Boolean(
        formUpd.platform ||
        formUpd.businessName ||
        formUpd.customerName ||
        formUpd.reviewDate ||
        formUpd.content ||
        typeof formUpd.rating !== 'undefined'
      )

      setBatchItems(prev => prev.map(it => it.id === item.id ? ({ ...it, status: 'done', confidence: d.confidence, mock: d.mock, form: { ...it.form, ...formUpd } }) : it))
      // If this is the selected one, push into form UI
      if (selectedIndex >= 0) {
        const idx = batchItems.findIndex(it => it.id === item.id)
        if (idx === selectedIndex && hasUpdates) {
          if (formUpd.platform) setValue('platform', formUpd.platform)
          if (formUpd.businessName) setValue('businessName', formUpd.businessName)
          if (formUpd.customerName) setValue('customerName', formUpd.customerName)
          if (formUpd.reviewDate) setValue('reviewDate', formUpd.reviewDate)
          if (formUpd.rating) setValue('rating', formUpd.rating.toString())
          if (formUpd.content) setValue('content', formUpd.content)
          if (d.confidence) setOcrConfidence(Math.round((d.confidence as number) * 100))
          try { (window as any).__recognized__ = true } catch {}
          setStep(prev => (prev === 'recognize' ? 'confirm' : prev))
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
      try { setOcrEngine(data?.data?.engine || data?.engine || null) } catch {}
      
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
  // Redesigned single-panel workflow
  return (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <SoftCard>
            {/* Stepper */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">새 리뷰 추가</h2>
                <span className="text-xs text-gray-500">
                  {batchItems.length > 0 ? `${Math.max(selectedIndex, 0) + 1}/${batchItems.length} 이미지` : '이미지를 업로드하세요'}
                </span>
              </div>
              <ol className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center">
                {steps.map((item, index) => {
                  const isCompleted = index < currentStepIndex
                  const isActive = item.key === step
                  return (
                    <li key={item.key} className="flex flex-1 items-start gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                          isCompleted ? 'border-emerald-500 bg-emerald-500 text-white' : isActive ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-200 bg-white text-gray-400'
                        }`}
                      >
                        {isCompleted ? <CheckIcon className="h-4 w-4" /> : index + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{item.title}</span>
                        <span className="text-xs text-gray-400">{item.description}</span>
                      </div>
                    </li>
                  )
                })}
              </ol>
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
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{processedItems}/{totalItems || 1} 인식 완료</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="mt-3 h-2" />
                  <p className="mt-4 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-500">
                    인식이 완료되면 자동으로 다음 단계로 이동합니다. 이미지가 선명할수록 정확도가 높아집니다.
                  </p>
                </div>
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-600">
                    자동으로 채워진 내용을 확인하고 필요한 부분만 수정하세요. 이미지 미리보기에서 다른 이미지를 선택하면 즉시 반영됩니다.
                  </p>
                  <div className="flex gap-2 text-xs">
                    <Button type="button" variant="outline" size="sm" onClick={() => setStep('upload')}>
                      다시 업로드
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setStep('recognize')}>
                      다시 인식
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  {ocrEngine && <span className="rounded-full border px-2 py-1">엔진: {ocrEngine}</span>}
                  {ocrConfidence !== null && <span className="rounded-full border px-2 py-1">신뢰도: {ocrConfidence}%</span>}
                  {(['platform','business','author','date','rating','content'] as const).map((key) =>
                    (autoFilled as any)[key] ? (
                      <span key={key} className="rounded-full border border-green-200 bg-green-50 px-2 py-1 text-green-700">
                        {key === 'platform' ? '플랫폼' : key === 'business' ? '업체명' : key === 'author' ? '작성자' : key === 'date' ? '작성일' : key === 'rating' ? '평점' : '내용'} 자동 입력
                      </span>
                    ) : null
                  )}
                </div>

                <input type="hidden" {...register('platform', { required: '플랫폼을 선택해주세요' })} />
                <input type="hidden" {...register('rating', { required: '평점을 선택하세요' })} />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <FormLabel>플랫폼</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {platforms.map(({ value }) => (
                        <Button
                          key={value}
                          type="button"
                          size="sm"
                          variant={selectedPlatform === value ? 'default' : 'outline'}
                          className={selectedPlatform === value ? 'bg-orange-500 hover:bg-orange-500/90 text-white' : 'text-gray-600'}
                          onClick={() => setValue('platform', value, { shouldValidate: true })}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                    {errors.platform && <FormMessage>{errors.platform.message}</FormMessage>}
                  </div>

                  <div className="space-y-2">
                    <FormLabel>평점</FormLabel>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Button
                          key={n}
                          type="button"
                          size="sm"
                          variant={Number(selectedRating) === n ? 'default' : 'outline'}
                          className={Number(selectedRating) === n ? 'bg-orange-500 hover:bg-orange-500/90 text-white' : 'text-gray-600'}
                          onClick={() => setValue('rating', String(n), { shouldValidate: true })}
                        >
                          {n} 점
                        </Button>
                      ))}
                    </div>
                    {errors.rating && <FormMessage>{errors.rating.message}</FormMessage>}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <FormLabel>업체명</FormLabel>
                      <Input placeholder="업체명을 입력" {...register('businessName', { required: '업체명을 입력하세요' })} />
                      {errors.businessName && <FormMessage>{errors.businessName.message}</FormMessage>}
                    </div>
                    <div>
                      <FormLabel>작성자</FormLabel>
                      <Input placeholder="예: 김**" {...register('customerName', { required: '작성자를 입력하세요' })} />
                      {errors.customerName && <FormMessage>{errors.customerName.message}</FormMessage>}
                    </div>
                    <div>
                      <FormLabel>작성일</FormLabel>
                      <Input type="date" {...register('reviewDate', { required: '작성일을 입력하세요' })} />
                      {errors.reviewDate && <FormMessage>{errors.reviewDate.message}</FormMessage>}
                    </div>
                    <div>
                      <FormLabel>원본 링크 (선택)</FormLabel>
                      <Input placeholder="https://" {...register('originalUrl')} />
                    </div>
                  </div>

                  <div>
                    <FormLabel>리뷰 내용</FormLabel>
                    <Textarea
                      className="mt-1 min-h-36"
                      placeholder="리뷰 내용을 입력해주세요..."
                      {...register('content', {
                        required: '리뷰 내용을 입력하세요',
                        minLength: { value: 10, message: '최소 10자 이상 입력해주세요' },
                      })}
                    />
                    {errors.content && <FormMessage>{errors.content.message}</FormMessage>}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
                  {(() => {
                    const v = getValues()
                    return (
                      <div className="space-y-2">
                        <div className="grid gap-2 text-xs text-gray-500 md:grid-cols-2">
                          <span>플랫폼: <strong className="text-gray-800">{v.platform || '-'}</strong></span>
                          <span>평점: <strong className="text-gray-800">{v.rating || '-'}</strong></span>
                          <span>업체명: <strong className="text-gray-800">{v.businessName || '-'}</strong></span>
                          <span>작성자: <strong className="text-gray-800">{v.customerName || '-'}</strong></span>
                          <span>작성일: <strong className="text-gray-800">{v.reviewDate || '-'}</strong></span>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-gray-500">리뷰 내용</p>
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
                            {(v.content && v.content.trim()) || '리뷰 내용을 입력하면 미리보기가 표시됩니다.'}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleSkipCurrent}>
                    건너뛰기
                  </Button>
                  <Button type="submit" disabled={isLoading || !minimalValid()} className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                    {isLoading ? (
                      <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> 저장 중...</span>
                    ) : (
                      '저장'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </SoftCard>

        </div>
      </div>
    )
  }
