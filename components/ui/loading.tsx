import { Skeleton } from "./skeleton"
import { Card } from "./card"

// 스피너 로딩 컴포넌트
export function Spinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  }
  
  return (
    <div className={`${sizes[size]} border-[#FF6B35] border-t-transparent rounded-full animate-spin ${className}`} />
  )
}

// 페이지 로딩 컴포넌트
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}

// 대시보드 스켈레톤
export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* 헤더 스켈레톤 */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* 통계 카드 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
      
      {/* 리뷰 리스트 스켈레톤 */}
      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// 리뷰 카드 스켈레톤
export function ReviewCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-2 mt-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </Card>
  )
}

// 폼 스켈레톤
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>
    </div>
  )
}

// 테이블 스켈레톤
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      {/* 헤더 */}
      <div className="bg-gray-50 border-b px-4 py-3">
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
      </div>
      
      {/* 행들 */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b px-4 py-3">
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(j => (
              <Skeleton key={j} className="h-4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// 프로필 스켈레톤
export function ProfileSkeleton() {
  return (
    <div className="flex items-start gap-4">
      <Skeleton className="w-20 h-20 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// 버튼 로딩 상태
export function ButtonLoading({ children = "처리 중..." }: { children?: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <Spinner size="sm" />
      {children}
    </span>
  )
}

// 이미지 로딩 스켈레톤
export function ImageSkeleton({ className = "w-full h-48" }: { className?: string }) {
  return (
    <Skeleton className={`${className} flex items-center justify-center`}>
      <svg
        className="w-8 h-8 text-gray-300"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
          clipRule="evenodd"
        />
      </svg>
    </Skeleton>
  )
}

// 통계 카드 스켈레톤
export function StatCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      <Skeleton className="h-8 w-24 mb-1" />
      <Skeleton className="h-3 w-32" />
    </Card>
  )
}

// 차트 스켈레톤
export function ChartSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        {[100, 80, 90, 60, 75].map((width, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
    </Card>
  )
}

// 목록 아이템 스켈레톤
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  )
}

// 풀스크린 로딩
export function FullscreenLoading({ message = "잠시만 기다려주세요..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <Spinner size="lg" className="mx-auto mb-4" />
          <div className="absolute inset-0 bg-[#FF6B35]/20 rounded-full animate-ping" />
        </div>
        <p className="text-lg font-medium text-gray-900 mb-2">{message}</p>
        <p className="text-sm text-gray-500">거의 완료되었습니다</p>
      </div>
    </div>
  )
}

// 인라인 로딩
export function InlineLoading({ text = "로딩 중" }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-gray-500">
      {text}
      <span className="animate-bounce">.</span>
      <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
      <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
    </span>
  )
}