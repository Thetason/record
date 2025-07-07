'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { PlatformBadge } from '@/components/ui/Badge'
import { validateReviewData } from '@/lib/api'
import { PLATFORMS, type Platform, type ReviewFormData } from '@/types/database'
import { Star, Upload, X, ExternalLink } from 'lucide-react'

interface ReviewFormProps {
  initialData?: Partial<ReviewFormData>
  onSubmit: (data: ReviewFormData) => Promise<void>
  submitLabel?: string
  loading?: boolean
}

export function ReviewForm({ 
  initialData = {}, 
  onSubmit, 
  submitLabel = '리뷰 저장', 
  loading = false 
}: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    reviewer_name: initialData.reviewer_name || '',
    review_text: initialData.review_text || '',
    rating: initialData.rating || undefined,
    source: initialData.source || '크몽',
    image_url: initialData.image_url || '',
    external_link: initialData.external_link || ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(initialData.image_url || '')

  const platformOptions = PLATFORMS.map(platform => ({
    value: platform,
    label: platform
  }))

  const handleChange = (field: keyof ReviewFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: '이미지 크기는 5MB 이하여야 합니다' }))
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: '이미지 파일만 업로드 가능합니다' }))
      return
    }

    setImageFile(file)
    setErrors(prev => ({ ...prev, image: '' }))

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    handleChange('image_url', '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form data
    const validationErrors = validateReviewData(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting review:', error)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => handleChange('rating', index + 1)}
        className={`h-6 w-6 transition-colors ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 hover:text-yellow-300'
        }`}
      >
        <Star className="h-full w-full" />
      </button>
    ))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="리뷰어 이름"
            value={formData.reviewer_name}
            onChange={(e) => handleChange('reviewer_name', e.target.value)}
            placeholder="고객 이름을 입력하세요"
            error={errors.reviewer_name}
            required
          />

          <Select
            label="플랫폼"
            value={formData.source}
            onChange={(e) => handleChange('source', e.target.value)}
            options={platformOptions}
            error={errors.source}
            required
          />
        </div>

        <Textarea
          label="리뷰 내용"
          value={formData.review_text}
          onChange={(e) => handleChange('review_text', e.target.value)}
          placeholder="고객의 리뷰 내용을 입력하세요"
          rows={6}
          error={errors.review_text}
          helperText="고객이 남긴 실제 리뷰 내용을 정확히 입력해주세요"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            평점 (선택사항)
          </label>
          <div className="flex gap-1">
            {renderStars(formData.rating || 0)}
          </div>
          {formData.rating && (
            <p className="mt-1 text-sm text-gray-600">
              {formData.rating}점 / 5점
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이미지 (선택사항)
          </label>
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="리뷰 이미지 미리보기"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  클릭하여 이미지 업로드
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG 파일 (최대 5MB)
                </p>
              </label>
            </div>
          )}
          {errors.image && (
            <p className="mt-1 text-sm text-red-500">{errors.image}</p>
          )}
        </div>

        <Input
          label="외부 링크 (선택사항)"
          value={formData.external_link}
          onChange={(e) => handleChange('external_link', e.target.value)}
          placeholder="https://example.com/review"
          error={errors.external_link}
          helperText="원본 리뷰 페이지 링크를 추가할 수 있습니다"
          leftIcon={<ExternalLink className="h-4 w-4" />}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1"
            loading={loading}
            disabled={loading}
          >
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            취소
          </Button>
        </div>
      </form>

      {/* Preview */}
      <div className="lg:sticky lg:top-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">미리보기</CardTitle>
            <CardDescription>
              이렇게 표시됩니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                  {formData.reviewer_name ? formData.reviewer_name[0] : '?'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {formData.reviewer_name || '리뷰어 이름'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <PlatformBadge platform={formData.source} />
                    {formData.rating && (
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < formData.rating! 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {formData.review_text || '리뷰 내용이 여기에 표시됩니다...'}
              </p>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="리뷰 이미지"
                  className="rounded-lg max-w-full h-auto"
                />
              )}

              {formData.external_link && (
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <a href={formData.external_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                    원본 리뷰 보기
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}