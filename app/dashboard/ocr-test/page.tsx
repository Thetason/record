'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface OCRResult {
  success: boolean;
  data?: {
    text: string;
    platform: string;
    rating: number;
    date: string;
    author?: string;
    confidence: number;
  };
  mock?: boolean;
  message?: string;
  error?: string;
}

export default function OCRTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // 인증 체크
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setResult({
        success: false,
        error: '이미지 파일만 업로드 가능합니다.'
      });
      return;
    }

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setResult({
        success: false,
        error: '파일 크기는 10MB 이하여야 합니다.'
      });
      return;
    }

    // 이미지 미리보기
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // OCR 처리
    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('OCR 에러:', error);
      setResult({
        success: false,
        error: 'OCR 처리 중 오류가 발생했습니다.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">OCR 테스트</h1>

        {/* 업로드 영역 */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={isUploading}
          />
          
          <label
            htmlFor="file-upload"
            className="cursor-pointer"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  OCR 처리 중...
                </span>
              ) : (
                '리뷰 이미지를 드래그하거나 클릭하여 업로드'
              )}
            </p>
            <p className="text-sm text-gray-500">
              지원 형식: JPG, PNG, GIF (최대 10MB)
            </p>
          </label>
        </div>

        {/* 이미지 미리보기 */}
        {imagePreview && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              업로드된 이미지
            </h2>
            <img
              src={imagePreview}
              alt="업로드된 이미지"
              className="max-w-full h-auto rounded border"
            />
          </div>
        )}

        {/* OCR 결과 */}
        {result && (
          <div className="mt-8">
            {result.success ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  OCR 결과
                  {result.mock && (
                    <span className="text-sm text-orange-600 ml-2">
                      (Mock 데이터 - API 키 설정 필요)
                    </span>
                  )}
                </h2>
                
                {result.message && (
                  <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-sm">
                    {result.message}
                  </div>
                )}

                {result.data && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">플랫폼:</span>
                        <span className="ml-2">{result.data.platform}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">평점:</span>
                        <span className="ml-2">{'⭐'.repeat(result.data.rating)} ({result.data.rating})</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">날짜:</span>
                        <span className="ml-2">{result.data.date}</span>
                      </div>
                      {result.data.author && (
                        <div>
                          <span className="font-medium text-gray-700">작성자:</span>
                          <span className="ml-2">{result.data.author}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-700">신뢰도:</span>
                        <span className="ml-2">{(result.data.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-medium text-gray-700 mb-2">추출된 텍스트:</h3>
                      <div className="p-3 bg-white border rounded whitespace-pre-wrap text-sm">
                        {result.data.text}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-medium text-gray-700 mb-2">분석된 리뷰 내용:</h3>
                      <div className="p-3 bg-white border rounded whitespace-pre-wrap text-sm">
                        {result.data.reviewText || result.data.text}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  오류 발생
                </h2>
                <p className="text-red-600">{result.error}</p>
              </div>
            )}
          </div>
        )}

        {/* 설정 안내 */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">📋 Google Vision API 설정 가이드</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <a
                href="https://console.cloud.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Cloud Console
              </a>
              에 접속
            </li>
            <li>새 프로젝트 생성 또는 기존 프로젝트 선택</li>
            <li>"API 및 서비스" → "라이브러리"에서 Cloud Vision API 활성화</li>
            <li>"사용자 인증 정보"에서 서비스 계정 생성 후 JSON 키 다운로드</li>
            <li>
              터미널에서 실행:
              <code className="ml-2 px-2 py-1 bg-gray-800 text-white rounded">
                node scripts/setup-google-vision.js
              </code>
            </li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-100 rounded text-sm">
            <strong>💡 팁:</strong> 현재 API 키가 설정되지 않아 Mock 데이터를 반환합니다.
            실제 OCR을 사용하려면 위 가이드를 따라 설정해주세요.
          </div>
        </div>
      </div>
    </div>
  );
}