'use client';

import { useState } from 'react';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';

export default function TestOCRPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      
      setSelectedFile(file);
      setError('');
      
      // 미리보기 URL 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OCR 처리 실패');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR 처리 중 오류 발생');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">OCR 테스트 페이지</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">리뷰 이미지 업로드</h2>
        
        <div className="space-y-4">
          {/* 파일 선택 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                이미지를 선택하거나 드래그하세요
              </span>
              <span className="text-xs text-gray-500 mt-1">
                (JPG, PNG, 최대 10MB)
              </span>
            </label>
          </div>

          {/* 미리보기 */}
          {previewUrl && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">미리보기</h3>
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto max-h-64 rounded border"
              />
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* 업로드 버튼 */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                처리 중...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                OCR 실행
              </>
            )}
          </button>
        </div>
      </div>

      {/* 결과 표시 */}
      {result && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">OCR 결과</h2>
          
          {result.mock && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
              ⚠️ {result.message}
            </div>
          )}

          <div className="space-y-4">
            {/* 추출된 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">플랫폼</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {result.data.platform || '알 수 없음'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">평점</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {'⭐'.repeat(result.data.rating)} ({result.data.rating}/5)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">날짜</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {result.data.date}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">신뢰도</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {(result.data.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* 추출된 텍스트 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추출된 텍스트
              </label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                  {result.data.text}
                </pre>
              </div>
            </div>

            {/* 작성자 (있는 경우) */}
            {result.data.author && (
              <div>
                <label className="block text-sm font-medium text-gray-700">작성자</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {result.data.author}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}