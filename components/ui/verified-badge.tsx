import { Check, Shield } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface VerifiedBadgeProps {
  isVerified: boolean
  verifiedAt?: Date | string | null
  verifiedBy?: string | null
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

export function VerifiedBadge({
  isVerified,
  verifiedAt,
  verifiedBy,
  size = 'md',
  showTooltip = true
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  if (!isVerified) {
    return null
  }

  const verificationDate = verifiedAt ? new Date(verifiedAt).toLocaleDateString('ko-KR') : null
  const verificationMethod = verifiedBy === 'screenshot' ? '스크린샷 인증' :
                           verifiedBy === 'api' ? 'API 인증' :
                           verifiedBy === 'manual' ? '수동 인증' : '인증됨'

  const BadgeIcon = () => (
    <div className="inline-flex items-center gap-1">
      <div className="relative">
        <Shield className={`${sizeClasses[size]} text-green-600 fill-green-100`} />
        <Check className={`absolute inset-0 ${sizeClasses[size]} text-white scale-50`} />
      </div>
      <span className={`${textSizeClasses[size]} text-green-600 font-medium`}>
        검증됨
      </span>
    </div>
  )

  if (!showTooltip) {
    return <BadgeIcon />
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex cursor-help">
            <BadgeIcon />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">✅ 검증된 리뷰</p>
            {verificationMethod && (
              <p className="text-xs text-gray-500">방법: {verificationMethod}</p>
            )}
            {verificationDate && (
              <p className="text-xs text-gray-500">일자: {verificationDate}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// 검증 요청 버튼 컴포넌트
interface VerifyButtonProps {
  reviewId: string
  onVerify?: () => void
  disabled?: boolean
}

export function VerifyButton({ reviewId, onVerify, disabled }: VerifyButtonProps) {
  const handleVerify = async () => {
    try {
      const response = await fetch('/api/reviews/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          verificationMethod: 'manual'
        })
      })

      if (response.ok) {
        onVerify?.()
      }
    } catch (error) {
      console.error('Verification error:', error)
    }
  }

  return (
    <button
      onClick={handleVerify}
      disabled={disabled}
      className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
    >
      <Shield className="w-4 h-4" />
      검증하기
    </button>
  )
}
