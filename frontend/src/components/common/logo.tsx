import { LogoIcon } from '@/components/common/logo-icon'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

type LogoProps = HTMLAttributes<HTMLSpanElement>

export function Logo({ className, ...props }: LogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-brand-base',
        className,
      )}
      {...props}
    >
      <LogoIcon className="size-8" />
      <span className="text-xl font-bold tracking-wide">FINANCY</span>
    </span>
  )
}
