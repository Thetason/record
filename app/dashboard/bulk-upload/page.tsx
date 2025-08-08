"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { 
  ArrowLeftIcon, 
  UploadIcon, 
  CheckIcon, 
  Cross2Icon,
  ReloadIcon,
  ImageIcon,
  FileTextIcon,
  TrashIcon
} from "@radix-ui/react-icons"

interface UploadedFile {
  id: string
  file: File
  preview: string
  status: 'pending' | 'processing' | 'success' | 'error'
  extractedData?: any
  error?: string
}

export default function BulkUploadPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : []
    addFiles(selectedFiles)
  }

  const addFiles = (newFiles: File[]) => {
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'))
    
    const uploadedFiles: UploadedFile[] = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending'
    }))
    
    setFiles(prev => [...prev, ...uploadedFiles])
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const processFiles = async () => {
    setIsProcessing(true)
    setProcessedCount(0)
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.status !== 'pending') continue
      
      // 상태 업데이트: processing
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'processing' } : f
      ))
      
      try {
        // OCR API 호출
        console.log(`Processing file: ${file.file.name}`)
        const formData = new FormData()
        formData.append('image', file.file)
        
        const ocrRes = await fetch('/api/ocr', {
          method: 'POST',
          body: formData
        })
        
        if (!ocrRes.ok) {
          const errorText = await ocrRes.text()
          console.error('OCR API error:', errorText)
          throw new Error('OCR 실패')
        }
        
        const ocrData = await ocrRes.json()
        console.log('OCR result:', ocrData)
        
        // 리뷰 저장
        if (ocrData.text || ocrData.processedData) {
          const reviewData = {
            platform: ocrData.processedData?.platform || '기타',
            business: ocrData.processedData?.businessName || '미분류',
            author: ocrData.processedData?.authorName || '익명',
            content: ocrData.processedData?.content || ocrData.text || '내용 없음',
            rating: ocrData.processedData?.rating || 5,
            reviewDate: ocrData.processedData?.reviewDate || new Date().toISOString().split('T')[0],
            imageUrl: file.preview
          }
          
          console.log('Saving review:', reviewData)
          
          const reviewRes = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
          })
          
          if (!reviewRes.ok) {
            const errorText = await reviewRes.text()
            console.error('Review save error:', errorText)
            throw new Error('리뷰 저장 실패')
          }
          
          console.log('Review saved successfully')
        } else {
          throw new Error('텍스트 추출 실패')
        }
        
        // 상태 업데이트: success
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'success', extractedData: ocrData.processedData } 
            : f
        ))
        setProcessedCount(prev => prev + 1)
        
      } catch (error: any) {
        // 상태 업데이트: error
        console.error(`Error processing ${file.file.name}:`, error)
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'error', error: error.message || '처리 실패' } 
            : f
        ))
      }
      
      // 다음 파일 처리 전 잠시 대기 (서버 부하 방지)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsProcessing(false)
  }

  const retryFile = async (id: string) => {
    const file = files.find(f => f.id === id)
    if (!file) return
    
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'pending', error: undefined } : f
    ))
  }

  const successCount = files.filter(f => f.status === 'success').length
  const errorCount = files.filter(f => f.status === 'error').length
  const pendingCount = files.filter(f => f.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>대시보드</span>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold">대량 리뷰 업로드</h1>
          </div>
          
          {files.length > 0 && (
            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-500">
                총 {files.length}개
              </span>
              {successCount > 0 && (
                <span className="text-green-600">
                  ✓ {successCount}개 완료
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600">
                  ✗ {errorCount}개 실패
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* 드래그 앤 드롭 영역 */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 mb-6 transition-all ${
            isDragging 
              ? 'border-[#FF6B35] bg-orange-50' 
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              리뷰 스크린샷을 드래그하여 업로드
            </h3>
            <p className="text-gray-500 mb-4">
              또는 파일을 선택하세요 (최대 50개)
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-white rounded-lg cursor-pointer hover:bg-[#E55A2B]"
            >
              <ImageIcon className="w-5 h-5" />
              이미지 선택
            </label>
          </div>
        </div>

        {/* 업로드된 파일 목록 */}
        {files.length > 0 && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">업로드된 파일</h3>
                  <div className="flex gap-2">
                    {pendingCount > 0 && !isProcessing && (
                      <button
                        onClick={processFiles}
                        className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E55A2B] text-sm"
                      >
                        전체 처리 시작 ({pendingCount}개)
                      </button>
                    )}
                    {isProcessing && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm">
                        <ReloadIcon className="w-4 h-4 animate-spin" />
                        처리 중... ({processedCount}/{files.length})
                      </div>
                    )}
                    <button
                      onClick={() => setFiles([])}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      전체 삭제
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {files.map(file => (
                  <div key={file.id} className="p-4 flex items-center gap-4">
                    {/* 썸네일 */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={file.preview} 
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* 파일 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileTextIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium truncate">
                          {file.file.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {(file.file.size / 1024).toFixed(1)} KB
                      </div>
                      
                      {/* 추출된 데이터 미리보기 */}
                      {file.extractedData && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                            {file.extractedData.platform}
                          </span>
                          <span className="ml-2">{file.extractedData.businessName}</span>
                          <span className="ml-2">{'⭐'.repeat(file.extractedData.rating)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* 상태 */}
                    <div className="flex items-center gap-2">
                      {file.status === 'pending' && (
                        <span className="text-gray-400 text-sm">대기 중</span>
                      )}
                      {file.status === 'processing' && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <ReloadIcon className="w-4 h-4 animate-spin" />
                          <span className="text-sm">처리 중</span>
                        </div>
                      )}
                      {file.status === 'success' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckIcon className="w-5 h-5" />
                          <span className="text-sm">완료</span>
                        </div>
                      )}
                      {file.status === 'error' && (
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 text-sm">{file.error}</span>
                          <button
                            onClick={() => retryFile(file.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            재시도
                          </button>
                        </div>
                      )}
                      
                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 완료 액션 */}
            {successCount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-2">
                  {successCount}개의 리뷰가 성공적으로 업로드되었습니다!
                </h3>
                <Link
                  href="/dashboard/reviews"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  리뷰 관리 페이지로 이동
                </Link>
              </div>
            )}
          </>
        )}

        {/* 사용법 안내 */}
        {files.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium mb-3">💡 대량 업로드 사용법</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li>1. 리뷰 스크린샷을 최대 50개까지 한번에 선택</li>
              <li>2. 드래그 앤 드롭 또는 파일 선택으로 업로드</li>
              <li>3. AI가 자동으로 텍스트 추출 및 정보 분석</li>
              <li>4. 플랫폼, 업체명, 평점 등 자동 분류</li>
              <li>5. 한번에 모든 리뷰 저장 완료!</li>
            </ol>
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>지원 플랫폼:</strong> 네이버, 카카오맵, 구글, 배민, 당근마켓, 인스타그램, 크몽
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}