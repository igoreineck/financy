import { IconButton } from '@/components/ui/icon-button'
import { Tag, type TagColor } from '@/components/ui/tag'
import { TypeBadge } from '@/components/ui/type-badge'
import { formatCurrencyCents, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { iconBgClassFor, isCategoryColor } from '@/pages/categories/color-map'
import { iconMap, isCategoryIcon } from '@/pages/categories/icon-map'
import { SquarePen, Trash } from 'lucide-react'

export type TransactionRowData = {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  occurredAt: string
  category: {
    id: string
    name: string
    color: string
    icon: string
  }
}

type TransactionRowProps = {
  transaction: TransactionRowData
  onEdit: () => void
  onDelete: () => void
}

export function TransactionRow({
  transaction,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const color: TagColor = isCategoryColor(transaction.category.color)
    ? transaction.category.color
    : 'gray'
  const Icon = isCategoryIcon(transaction.category.icon)
    ? iconMap[transaction.category.icon]
    : null
  const sign = transaction.type === 'INCOME' ? '+' : '-'

  return (
    <tr className="border-b border-gray-200 last:border-b-0">
      <td className="px-4 py-4 text-sm font-medium text-gray-800">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg',
              iconBgClassFor(color),
            )}
          >
            {Icon ? <Icon className="size-5" /> : null}
          </span>
          {transaction.description}
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-600">
        {formatDate(transaction.occurredAt)}
      </td>
      <td className="px-4 py-4">
        <Tag color={color}>{transaction.category.name}</Tag>
      </td>
      <td className="px-4 py-4">
        <TypeBadge type={transaction.type} />
      </td>
      <td className="px-4 py-4 text-right text-sm font-semibold text-gray-800">
        {sign} {formatCurrencyCents(transaction.amount)}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <IconButton
            variant="danger"
            aria-label={`Excluir ${transaction.description}`}
            onClick={onDelete}
          >
            <Trash />
          </IconButton>
          <IconButton
            aria-label={`Editar ${transaction.description}`}
            onClick={onEdit}
          >
            <SquarePen />
          </IconButton>
        </div>
      </td>
    </tr>
  )
}
