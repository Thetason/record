'use client'

import React from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-full transition-base disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary hover:bg-gray-800 text-white',
        secondary: 'bg-white hover:bg-gray-50 text-primary border border-gray-200',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900',
        outline: 'border-2 border-primary bg-transparent hover:bg-primary text-primary hover:text-white',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-6 text-base',
        lg: 'h-14 px-8 text-base',
        xl: 'h-16 px-10 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, asChild, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button'
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          className
        )}
        ref={ref as any}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {children}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }