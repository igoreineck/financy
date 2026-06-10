import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type AuthCardProps = {
  title: string
  subtitle?: string
  footer?: ReactNode
  children: ReactNode
  className?: string
}

export function AuthCard({
  title,
  subtitle,
  footer,
  children,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        'w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm',
        className,
      )}
    >
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      {children}
      {footer ? (
        <div className="mt-6 flex justify-center text-sm text-gray-500">
          {footer}
        </div>
      ) : null}
    </div>
  )
}
