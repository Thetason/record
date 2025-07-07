'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Share2, Copy, CheckCircle } from 'lucide-react'

interface ShareButtonProps {
  username: string
}

export function ShareButton({ username }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/${username}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${username}님의 Re:cord 프로필`,
          text: '프리랜서 리뷰 포트폴리오를 확인해보세요',
          url: url
        })
        return
      } catch (error) {
        // Fall through to copy functionality
      }
    }

    // Fallback to copy
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleShare}
      className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2"
    >
      {copied ? (
        <>
          <CheckCircle className="h-4 w-4" />
          복사됨!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          공유하기
        </>
      )}
    </Button>
  )
}