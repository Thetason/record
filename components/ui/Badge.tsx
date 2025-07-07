import React from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { Platform } from '@/types/database'
import { PLATFORM_CONFIG } from '@/types/database'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-base',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-primary-100 text-primary-800',
        secondary: 'bg-secondary-100 text-secondary-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        outline: 'border border-gray-200 bg-white text-gray-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  platform?: Platform
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, platform, icon, children, ...props }, ref) => {
    // If platform is specified, use platform-specific styling
    if (platform && PLATFORM_CONFIG[platform]) {
      const config = PLATFORM_CONFIG[platform]
      return (
        <div
          ref={ref}
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-base',
            className
          )}
          style={{
            backgroundColor: config.bgColor,
            color: config.textColor,
          }}
          {...props}
        >
          {icon && <span className="mr-1">{icon}</span>}
          {!icon && config.icon && <span className="mr-1">{config.icon}</span>}
          {children || config.displayName}
        </div>
      )
    }

    // Default badge styling
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

// Platform-specific badge component
export interface PlatformBadgeProps extends Omit<BadgeProps, 'platform'> {
  platform: Platform
  showIcon?: boolean
}

export const PlatformBadge = React.forwardRef<HTMLDivElement, PlatformBadgeProps>(
  ({ platform, showIcon = true, children, ...props }, ref) => {
    const config = PLATFORM_CONFIG[platform]
    
    return (
      <Badge
        ref={ref}
        platform={platform}
        icon={showIcon ? config.icon : undefined}
        {...props}
      >
        {children || config.displayName}
      </Badge>
    )
  }
)

PlatformBadge.displayName = 'PlatformBadge'

export { Badge, badgeVariants }