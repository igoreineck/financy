import { Logo } from '@/components/common/logo'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type AuthCardProps = {
  title: string
  subtitle?: string
  footer?: ReactNode
  children: ReactNode
  className?: string
  align?: 'left' | 'center'
}

export function AuthCard({
  title,
  subtitle,
  footer,
  children,
  className,
  align = 'left',
}: AuthCardProps) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Logo className="h-8 w-auto" />
      <div
        className={cn(
          'w-full rounded-xl border border-gray-200 bg-white p-8 shadow-sm',
          className,
        )}
      >
        <div
          className={cn(
            'mb-8 flex flex-col gap-1',
            align === 'center' && 'items-center text-center',
          )}
        >
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
        </div>
        {children}
        {footer ? (
          <div className="mt-6 text-sm text-gray-500">{footer}</div>
        ) : null}
      </div>
    </div>
  )
}
