'use client'

import React from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center font-semibold rounded-2xl transition-smooth focus-ring disabled:opacity-50 disabled:pointer-events-none overflow-hidden group',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-lg hover:shadow-xl hover:shadow-primary/25 hover:scale-105 active:scale-95',
        secondary: 'bg-gradient-to-r from-secondary to-secondary-600 text-white shadow-lg hover:shadow-xl hover:shadow-secondary/25 hover:scale-105 active:scale-95',
        accent: 'bg-gradient-to-r from-accent to-accent-600 text-white shadow-lg hover:shadow-xl hover:shadow-accent/25 hover:scale-105 active:scale-95',
        ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900 hover:scale-105 active:scale-95',
        outline: 'border-2 border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 text-neutral-700 hover:scale-105 active:scale-95',
        glass: 'glass-button text-white hover:scale-105 active:scale-95',
        gradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
      },
      size: {
        sm: 'h-9 px-4 text-sm min-w-[80px]',
        md: 'h-11 px-6 text-sm min-w-[100px]',
        lg: 'h-13 px-8 text-base min-w-[120px]',
        xl: 'h-16 px-10 text-lg min-w-[140px]',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-lg',
        md: 'rounded-xl',
        lg: 'rounded-2xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      rounded: 'lg',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  asChild?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  shimmer?: boolean
  glow?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, loading, children, disabled, asChild, icon, iconPosition = 'left', shimmer = false, glow = false, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button'
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, rounded }),
          shimmer && 'shimmer',
          glow && 'hover-glow',
          className
        )}
        ref={ref as any}
        disabled={disabled || loading}
        {...props}
      >
        {/* Shimmer overlay */}
        {shimmer && (
          <div className="absolute inset-0 -top-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        )}
        
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Content */}
        <div className={cn(
          'flex items-center justify-center gap-2',
          loading && 'opacity-0'
        )}>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </div>
        
        {/* Ripple effect background */}
        <div className="absolute inset-0 bg-white/10 transform scale-0 group-active:scale-100 transition-transform duration-200 rounded-inherit" />
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }