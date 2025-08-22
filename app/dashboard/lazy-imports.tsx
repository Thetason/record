'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load heavy components
export const StatsChart = dynamic(
  () => import('./stats/chart').then(mod => mod.StatsChart),
  { 
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false 
  }
)

export const PlatformDistribution = dynamic(
  () => import('./stats/platform-distribution').then(mod => mod.PlatformDistribution),
  { 
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false 
  }
)

export const ReviewsList = dynamic(
  () => import('./reviews/reviews-list').then(mod => mod.ReviewsList),
  { 
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    ),
    ssr: true 
  }
)