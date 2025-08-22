'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface LazyLoadProps {
  children: ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  placeholder?: ReactNode
  onIntersect?: () => void
}

export function LazyLoad({
  children,
  className,
  threshold = 0.1,
  rootMargin = '100px',
  placeholder,
  onIntersect,
}: LazyLoadProps) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const targetRef = useRef<HTMLDivElement>(null)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoadedRef.current) {
            setIsIntersecting(true)
            hasLoadedRef.current = true
            onIntersect?.()
            observer.unobserve(target)
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(target)

    return () => {
      if (target) {
        observer.unobserve(target)
      }
    }
  }, [threshold, rootMargin, onIntersect])

  return (
    <div ref={targetRef} className={cn('lazy-load-container', className)}>
      {isIntersecting ? children : (placeholder || <LoadingPlaceholder />)}
    </div>
  )
}

function LoadingPlaceholder() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-48 w-full"></div>
    </div>
  )
}

// 컴포넌트 Lazy Loading Hook
export function useLazyComponent<T>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>
) {
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const load = async () => {
    if (Component) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const module = await importFn()
      setComponent(() => module.default)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return { Component, isLoading, error, load }
}