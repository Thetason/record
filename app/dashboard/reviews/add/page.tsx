'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/toast';

export default function AddReviewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [extractedData, setExtractedData] = useState({
    platform: '',
    business: '',
    rating: 5,
    content: '',
    author: '',
    reviewDate: new Date().toISOString().split('T')[0]
  });

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      
      setSelectedFile(file);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // 즉시 OCR 시작
      performOCR(file);
    }
  };

  // OCR 수행
  const performOCR = async (file: File) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setOcrResult(result.data);
        
        // 추출된 데이터로 폼 자동 채우기
        setExtractedData({
          platform: result.data.platform || '',
          business: extractBusinessName(result.data.text) || '',
          rating: result.data.rating || 5,
          content: cleanReviewText(result.data.text) || '',
          author: result.data.author || '익명',
          reviewDate: result.data.date || new Date().toISOString().split('T')[0]
        });
        
        toast.success('텍스트 추출 완료! 내용을 확인하고 수정할 수 있습니다.');
      } else {
        toast.error('텍스트 추출 실패. 수동으로 입력해주세요.');
      }
    } catch (error) {
      console.error('OCR 에러:', error);
      toast.error('텍스트 추출 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 비즈니스명 추출 헬퍼
  const extractBusinessName = (text: string): string => {
    // 첫 줄이나 특정 패턴에서 비즈니스명 추출
    const lines = text.split('\\n');
    return lines[0]?.substring(0, 30) || '';
  };

  // 리뷰 텍스트 정리 헬퍼
  const cleanReviewText = (text: string): string => {
    // 날짜, 평점 등을 제거하고 순수 리뷰 내용만 추출
    return text
      .replace(/⭐+/g, '')
      .replace(/\d{4}[년.-]\d{1,2}[월.-]\d{1,2}/g, '')
      .replace(/평점.*?\d점/g, '')
      .trim();
  };

  // 리뷰 저장
  const handleSubmit = async () => {
    if (!extractedData.content) {
      toast.error('리뷰 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...extractedData,
          imageUrl: previewUrl,
          verifiedBy: 'screenshot',
          isVerified: true
        }),
      });

      if (response.ok) {
        toast.success('리뷰가 성공적으로 추가되었습니다!');
        router.push('/dashboard');
      } else {
        throw new Error('리뷰 저장 실패');
      }
    } catch (error) {
      console.error('저장 에러:', error);
      toast.error('리뷰 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">리뷰 추가</h1>
      
      {/* 이미지 업로드 영역 (메인) */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          📸 리뷰 스크린샷 업로드
        </h2>
        <p className="text-gray-600 mb-6">
          네이버, 카카오, 인스타그램 등에서 캡처한 리뷰 이미지를 업로드하세요.
          자동으로 텍스트를 추출합니다.
        </p>

        {!previewUrl ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-16 h-16 text-gray-400 mb-4" />
              <span className="text-lg font-medium text-gray-700">
                클릭하여 이미지 선택
              </span>
              <span className="text-sm text-gray-500 mt-2">
                또는 이미지를 여기에 드래그하세요
              </span>
              <span className="text-xs text-gray-400 mt-4">
                지원 형식: JPG, PNG (최대 10MB)
              </span>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 이미지 미리보기 */}
            <div className="relative">
              <img
                src={previewUrl}
                alt="리뷰 이미지"
                className="w-full max-h-96 object-contain rounded-lg border"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="bg-white p-4 rounded-lg">
                    <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
                    <p className="mt-2 text-sm">텍스트 추출 중...</p>
                  </div>
                </div>
              )}
            </div>

            {/* 다시 선택 버튼 */}
            <button
              onClick={() => {
                setPreviewUrl('');
                setSelectedFile(null);
                setOcrResult(null);
                setExtractedData({
                  platform: '',
                  business: '',
                  rating: 5,
                  content: '',
                  author: '',
                  reviewDate: new Date().toISOString().split('T')[0]
                });
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              다른 이미지 선택
            </button>
          </div>
        )}
      </div>

      {/* 추출된 데이터 편집 폼 */}
      {ocrResult && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Check className="w-6 h-6 text-green-500 mr-2" />
            <h2 className="text-xl font-semibold">추출된 정보 확인</h2>
          </div>

          {ocrResult.mock && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 inline mr-2" />
              테스트 모드: Google Vision API가 설정되지 않아 샘플 데이터를 사용합니다.
            </div>
          )}

          <div className="space-y-4">
            {/* 플랫폼 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                플랫폼
              </label>
              <select
                value={extractedData.platform}
                onChange={(e) => setExtractedData({...extractedData, platform: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                <option value="naver">네이버</option>
                <option value="kakao">카카오</option>
                <option value="instagram">인스타그램</option>
                <option value="google">구글</option>
                <option value="other">기타</option>
              </select>
            </div>

            {/* 업체명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                업체명
              </label>
              <input
                type="text"
                value={extractedData.business}
                onChange={(e) => setExtractedData({...extractedData, business: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="예: 스타벅스 강남점"
              />
            </div>

            {/* 평점 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                평점
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setExtractedData({...extractedData, rating: star})}
                    className={`text-2xl ${star <= extractedData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* 리뷰 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                리뷰 내용
              </label>
              <textarea
                value={extractedData.content}
                onChange={(e) => setExtractedData({...extractedData, content: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="추출된 리뷰 내용을 확인하고 필요시 수정하세요"
              />
            </div>

            {/* 작성일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                리뷰 작성일
              </label>
              <input
                type="date"
                value={extractedData.reviewDate}
                onChange={(e) => setExtractedData({...extractedData, reviewDate: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 저장 버튼 */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    리뷰 저장
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}