import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'
import { Link as RouterLink } from 'react-router'

type LinkProps = ComponentProps<typeof RouterLink>

export function Link({ className, ...props }: LinkProps) {
  return (
    <RouterLink
      className={cn(
        'text-sm font-medium text-brand-base transition-colors',
        'hover:text-brand-dark hover:underline',
        'focus-visible:outline-none focus-visible:underline',
        className,
      )}
      {...props}
    />
  )
}
