import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'glass' | 'gradient' | 'elevated' | 'flat' | 'outline'
  glow?: boolean
  shimmer?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, padding = 'md', variant = 'default', glow = false, shimmer = false, children, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    }

    const variantClasses = {
      default: 'bg-white border border-neutral-200/50 shadow-lg',
      glass: 'glass-card border-white/20',
      gradient: 'bg-gradient-to-br from-white to-neutral-50 border border-neutral-200/50 shadow-xl',
      elevated: 'bg-white shadow-2xl border-0',
      flat: 'bg-neutral-50 border-0 shadow-none',
      outline: 'bg-transparent border-2 border-neutral-200 shadow-none',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl transition-smooth overflow-hidden group',
          variantClasses[variant],
          hover && 'hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1',
          glow && 'hover:shadow-primary/20',
          shimmer && 'shimmer',
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {/* Shimmer overlay */}
        {shimmer && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
        )}
        
        {/* Gradient border effect for glass variant */}
        {variant === 'glass' && (
          <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-white/20 to-white/5 pointer-events-none" />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Hover glow effect */}
        {glow && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}
      </div>
    )
  }
)

Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-2 p-0', className)}
    {...props}
  />
))

CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-bold leading-tight tracking-tight text-neutral-900', className)}
    {...props}
  />
))

CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm leading-relaxed text-neutral-600', className)}
    {...props}
  />
))

CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mt-4', className)} {...props} />
))

CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between mt-6 pt-4 border-t border-neutral-100', className)}
    {...props}
  />
))

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }