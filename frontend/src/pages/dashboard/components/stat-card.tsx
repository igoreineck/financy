import { formatCurrencyCents } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type VariantProps, cva } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'

const iconVariants = cva(
  'flex size-10 shrink-0 items-center justify-center rounded-lg',
  {
    variants: {
      variant: {
        positive: 'bg-green-light text-green-base',
        negative: 'bg-red-light text-red-base',
        neutral: 'bg-gray-200 text-gray-700',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

const valueVariants = cva('text-3xl font-bold', {
  variants: {
    variant: {
      positive: 'text-success',
      negative: 'text-danger',
      neutral: 'text-gray-800',
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
        <span className={cn(iconVariants({ variant }))} aria-hidden="true">
          <Icon className="size-5" />
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </span>
      </div>
      <span className={cn(valueVariants({ variant }))}>
        {formatCurrencyCents(valueCents)}
      </span>
    </div>
  )
}
