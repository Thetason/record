import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            className={cn(
              'flex min-h-[100px] w-full rounded-lg border bg-white px-3 py-2 text-sm transition-base placeholder:text-gray-400 resize-y',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500 animate-slide-up flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }