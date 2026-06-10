import { cn } from '@/lib/utils'
import { CircleArrowDown, CircleArrowUp } from 'lucide-react'

type TransactionType = 'INCOME' | 'EXPENSE'

type TypeBadgeProps = {
  type: TransactionType
  className?: string
}

const labels: Record<TransactionType, string> = {
  INCOME: 'Entrada',
  EXPENSE: 'Saída',
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const Icon = type === 'INCOME' ? CircleArrowUp : CircleArrowDown
  return (
    <span
      data-type={type}
      className={cn(
        'inline-flex items-center gap-2 text-sm font-medium',
        type === 'INCOME' ? 'text-success' : 'text-danger',
        className,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {labels[type]}
    </span>
  )
}
