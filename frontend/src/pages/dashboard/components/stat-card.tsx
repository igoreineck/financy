import { formatCurrencyCents } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type VariantProps, cva } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'

const iconVariants = cva('shrink-0', {
  variants: {
    variant: {
      positive: 'text-success',
      negative: 'text-danger',
      neutral: 'text-purple-base',
    },
  },
  defaultVariants: { variant: 'neutral' },
})

export type StatCardVariant = NonNullable<
  VariantProps<typeof iconVariants>['variant']
>

type StatCardProps = {
  label: string
  valueCents: number
  icon: LucideIcon
  variant?: StatCardVariant
}

export function StatCard({
  label,
  valueCents,
  icon: Icon,
  variant = 'neutral',
}: StatCardProps) {
  return (
    <div
      data-variant={variant}
      className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5"
    >
      <div className="flex items-center gap-3">
        <Icon
          className={cn('size-5', iconVariants({ variant }))}
          aria-hidden="true"
        />
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </span>
      </div>
      <span className="text-3xl font-semibold text-gray-800">
        {formatCurrencyCents(valueCents)}
      </span>
    </div>
  )
}
