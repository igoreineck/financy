import { cn } from '@/lib/utils'
import type { SVGProps } from 'react'

export function LogoIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Financy"
      className={cn('text-brand-base', className)}
      {...props}
    >
      <circle cx="12" cy="12" r="8" fill="currentColor" />
      <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.35" />
      <circle cx="20" cy="20" r="8" fill="currentColor" />
      <circle cx="20" cy="20" r="3" fill="white" fillOpacity="0.35" />
    </svg>
  )
}
