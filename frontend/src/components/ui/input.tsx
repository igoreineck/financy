import { cn } from '@/lib/utils'
import type { ComponentProps, ReactNode } from 'react'
import { forwardRef } from 'react'

type InputProps = ComponentProps<'input'> & {
  icon?: ReactNode
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, disabled, ...props }, ref) => {
    return (
      <div
        data-state={error ? 'error' : disabled ? 'disabled' : undefined}
        className={cn(
          'group flex h-12 items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 transition-colors',
          'focus-within:border-brand-base',
          'data-[state=error]:border-danger',
          'data-[state=disabled]:bg-gray-100 data-[state=disabled]:border-gray-200',
          className,
        )}
      >
        {icon ? (
          <span
            aria-hidden="true"
            className={cn(
              'flex size-5 items-center justify-center text-gray-400 transition-colors',
              'group-focus-within:text-brand-base',
              'group-data-[state=error]:text-danger',
              'group-data-[state=disabled]:text-gray-400',
              '[&_svg]:size-5',
            )}
          >
            {icon}
          </span>
        ) : null}
        <input
          ref={ref}
          disabled={disabled}
          aria-invalid={error || undefined}
          className={cn(
            'flex-1 bg-transparent text-sm text-gray-800 outline-none',
            'placeholder:text-gray-400',
            'disabled:cursor-not-allowed',
          )}
          {...props}
        />
      </div>
    )
  },
)
Input.displayName = 'Input'
