'use client'

import { Skeleton } from '@/components/ui/skeleton'

// Fallback wrappers kept local until dashboard-specific modules are restored.
export function StatsChart() {
  return <Skeleton className="h-[300px] w-full" />
}

export function PlatformDistribution() {
  return <Skeleton className="h-[300px] w-full" />
}

export function ReviewsList() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}
