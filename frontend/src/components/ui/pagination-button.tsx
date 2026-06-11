import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

type PaginationButtonProps = ComponentProps<'button'> & {
  active?: boolean
}

export function PaginationButton({
  className,
  active,
  type = 'button',
  ...props
}: PaginationButtonProps) {
  return (
    <button
      type={type}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-base/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        active
          ? 'border-brand-base bg-brand-base text-white hover:bg-brand-dark'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-200',
        className,
      )}
      {...props}
    />
  )
}
