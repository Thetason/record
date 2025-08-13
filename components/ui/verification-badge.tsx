import { CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerificationBadgeProps {
  isVerified: boolean;
  verifiedBy?: string | null;
  verifiedAt?: Date | string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function VerificationBadge({ 
  isVerified, 
  verifiedBy, 
  verifiedAt, 
  size = 'md' 
}: VerificationBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (!isVerified) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="gap-1">
              <AlertCircle className={`${sizeClasses[size]} text-gray-400`} />
              <span className="text-xs">미검증</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>이 리뷰는 아직 검증되지 않았습니다</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const verificationMethod = {
    manual: '수동 검증',
    screenshot: '스크린샷 검증',
    api: 'API 검증',
    ocr: 'OCR 검증'
  }[verifiedBy || 'manual'] || '검증됨';

  const verificationDate = verifiedAt 
    ? new Date(verifiedAt).toLocaleDateString('ko-KR')
    : '';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge className="gap-1 bg-green-100 text-green-800 hover:bg-green-200">
            <Shield className={`${sizeClasses[size]}`} />
            <span className="text-xs">검증됨</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">✅ 검증된 리뷰</p>
            <p className="text-xs">방법: {verificationMethod}</p>
            {verificationDate && (
              <p className="text-xs">날짜: {verificationDate}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}