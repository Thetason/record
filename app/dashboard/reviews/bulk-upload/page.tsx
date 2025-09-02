'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, Check, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface ProcessedReview {
  id: string;
  imageUrl: string;
  platform: string;
  business: string;
  rating: number;
  content: string;
  author: string;
  reviewDate: string;
  isProcessing: boolean;
  isCompleted: boolean;
  error?: string;
}

export default function BulkUploadPage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processedReviews, setProcessedReviews] = useState<ProcessedReview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // 드래그 핸들러
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // 드롭 핸들러
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // 파일 처리
  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files).filter(file => {
      // 이미지 파일만 허용
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}은(는) 이미지 파일이 아닙니다.`);
        return false;
      }
      // 10MB 제한
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}의 크기가 10MB를 초과합니다.`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  // 파일 제거
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // OCR 처리 및 리뷰 생성
  const processImages = async () => {
    if (selectedFiles.length === 0) {
      toast.error('이미지를 선택해주세요.');
      return;
    }

    setIsProcessing(true);
    const reviews: ProcessedReview[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const id = `review-${Date.now()}-${i}`;
      
      // 미리보기 URL 생성
      const reader = new FileReader();
      const imageUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // 초기 리뷰 객체 생성
      const review: ProcessedReview = {
        id,
        imageUrl,
        platform: '',
        business: '',
        rating: 5,
        content: '',
        author: '',
        reviewDate: new Date().toISOString().split('T')[0],
        isProcessing: true,
        isCompleted: false
      };

      reviews.push(review);
      setProcessedReviews([...reviews]);

      // OCR 처리
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          review.platform = result.data.platform || detectPlatform(result.data.text);
          review.business = extractBusinessName(result.data.text) || '';
          review.rating = result.data.rating || 5;
          review.content = cleanReviewText(result.data.text) || '';
          review.author = result.data.author || '익명';
          review.reviewDate = result.data.date || new Date().toISOString().split('T')[0];
          review.isProcessing = false;
          review.isCompleted = true;
        } else {
          review.error = '텍스트 추출 실패';
          review.isProcessing = false;
        }
      } catch (error) {
        console.error('OCR 에러:', error);
        review.error = 'OCR 처리 중 오류 발생';
        review.isProcessing = false;
      }

      setProcessedReviews([...reviews]);
    }

    setIsProcessing(false);
    toast.success(`${reviews.filter(r => r.isCompleted).length}개의 리뷰가 처리되었습니다.`);
  };

  // 플랫폼 감지
  const detectPlatform = (text: string): string => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('네이버') || lowerText.includes('naver')) return 'naver';
    if (lowerText.includes('카카오') || lowerText.includes('kakao')) return 'kakao';
    if (lowerText.includes('인스타') || lowerText.includes('instagram')) return 'instagram';
    if (lowerText.includes('구글') || lowerText.includes('google')) return 'google';
    return 'other';
  };

  // 비즈니스명 추출
  const extractBusinessName = (text: string): string => {
    const lines = text.split('\\n');
    return lines[0]?.substring(0, 30) || '';
  };

  // 리뷰 텍스트 정리
  const cleanReviewText = (text: string): string => {
    return text
      .replace(/⭐+/g, '')
      .replace(/\d{4}[년.-]\d{1,2}[월.-]\d{1,2}/g, '')
      .replace(/평점.*?\d점/g, '')
      .trim();
  };

  // 개별 리뷰 수정
  const updateReview = (id: string, field: keyof ProcessedReview, value: any) => {
    setProcessedReviews(prev => 
      prev.map(review => 
        review.id === id ? { ...review, [field]: value } : review
      )
    );
  };

  // 모든 리뷰 저장
  const saveAllReviews = async () => {
    const validReviews = processedReviews.filter(r => r.isCompleted && !r.error);
    
    if (validReviews.length === 0) {
      toast.error('저장할 리뷰가 없습니다.');
      return;
    }

    setIsProcessing(true);
    let successCount = 0;

    for (const review of validReviews) {
      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: review.platform,
            business: review.business,
            rating: review.rating,
            content: review.content,
            author: review.author,
            reviewDate: review.reviewDate,
            imageUrl: review.imageUrl,
            verifiedBy: 'screenshot',
            isVerified: true
          }),
        });

        if (response.ok) {
          successCount++;
        }
      } catch (error) {
        console.error('저장 에러:', error);
      }
    }

    setIsProcessing(false);
    toast.success(`${successCount}개의 리뷰가 저장되었습니다!`);
    
    if (successCount > 0) {
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">리뷰 대량 업로드</h1>
      
      {/* 업로드 영역 */}
      {selectedFiles.length === 0 ? (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              리뷰 스크린샷을 여기에 드래그하거나 클릭하여 선택
            </p>
            <p className="text-sm text-gray-500">
              여러 이미지를 한 번에 선택할 수 있습니다 (최대 10MB/이미지)
            </p>
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 선택된 파일 목록 */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">선택된 이미지 ({selectedFiles.length}개)</h3>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="add-more"
                />
                <label
                  htmlFor="add-more"
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
                >
                  이미지 추가
                </label>
                <button
                  onClick={processImages}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 inline mr-2" />
                      처리 중...
                    </>
                  ) : (
                    'OCR 처리 시작'
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 처리된 리뷰 목록 */}
          {processedReviews.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">처리된 리뷰</h3>
              
              {processedReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg border p-4">
                  <div className="flex gap-4">
                    {/* 이미지 미리보기 */}
                    <div className="w-32 h-32 flex-shrink-0">
                      <img
                        src={review.imageUrl}
                        alt="리뷰 이미지"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* 리뷰 정보 */}
                    <div className="flex-1 space-y-3">
                      {review.isProcessing ? (
                        <div className="flex items-center text-gray-500">
                          <Loader2 className="animate-spin w-4 h-4 mr-2" />
                          OCR 처리 중...
                        </div>
                      ) : review.error ? (
                        <div className="flex items-center text-red-500">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {review.error}
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs text-gray-600">플랫폼</label>
                              <select
                                value={review.platform}
                                onChange={(e) => updateReview(review.id, 'platform', e.target.value)}
                                className="w-full px-2 py-1 text-sm border rounded"
                              >
                                <option value="">선택</option>
                                <option value="naver">네이버</option>
                                <option value="kakao">카카오</option>
                                <option value="instagram">인스타그램</option>
                                <option value="google">구글</option>
                                <option value="other">기타</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">업체명</label>
                              <input
                                type="text"
                                value={review.business}
                                onChange={(e) => updateReview(review.id, 'business', e.target.value)}
                                className="w-full px-2 py-1 text-sm border rounded"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">평점</label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => updateReview(review.id, 'rating', star)}
                                    className={`text-lg ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">리뷰 내용</label>
                            <textarea
                              value={review.content}
                              onChange={(e) => updateReview(review.id, 'content', e.target.value)}
                              className="w-full px-2 py-1 text-sm border rounded resize-none"
                              rows={2}
                            />
                          </div>
                          {review.isCompleted && (
                            <div className="flex items-center text-green-500 text-sm">
                              <Check className="w-4 h-4 mr-1" />
                              처리 완료
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* 저장 버튼 */}
              {processedReviews.some(r => r.isCompleted) && (
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    취소
                  </button>
                  <button
                    onClick={saveAllReviews}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        모든 리뷰 저장 ({processedReviews.filter(r => r.isCompleted && !r.error).length}개)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}