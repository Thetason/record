import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export function LoadingSpinner({ 
  size = 'md', 
  className,
  label 
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 
        className={cn(
          "animate-spin text-blue-600",
          sizeClasses[size],
          className
        )} 
      />
      {label && (
        <p className="text-sm text-gray-600">{label}</p>
      )}
    </div>
  );
}

// 전체 페이지 로딩
export function PageLoading({ message = "로딩 중..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// 버튼 로딩 상태
interface ButtonLoadingProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
}

export function ButtonLoading({ 
  children,
  isLoading,
  loadingText = "처리 중...",
  className = "",
  ...props 
}: ButtonLoadingProps) {
  return (
    <button
      disabled={isLoading}
      className={cn(
        "flex items-center justify-center gap-2",
        isLoading && "opacity-70 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

// 오버레이 로딩
export function OverlayLoading({ 
  isLoading,
  message = "처리 중입니다..."
}: {
  isLoading: boolean;
  message?: string;
}) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <LoadingSpinner size="lg" label={message} />
      </div>
    </div>
  );
}
