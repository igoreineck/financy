import { IconButton } from '@/components/ui/icon-button'
import { Tag, type TagColor } from '@/components/ui/tag'
import { TypeBadge } from '@/components/ui/type-badge'
import { formatCurrencyCents, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { isCategoryColor } from '@/pages/categories/color-map'
import { Pencil, Trash2 } from 'lucide-react'

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
  const sign = transaction.type === 'INCOME' ? '+' : '-'

  return (
    <tr className="border-b border-gray-200 last:border-b-0">
      <td className="px-4 py-4 text-sm font-medium text-gray-800">
        {transaction.description}
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
      <td
        className={cn(
          'px-4 py-4 text-right text-sm font-semibold',
          transaction.type === 'INCOME' ? 'text-success' : 'text-danger',
        )}
      >
        {sign}
        {formatCurrencyCents(transaction.amount)}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <IconButton
            variant="danger"
            aria-label={`Excluir ${transaction.description}`}
            onClick={onDelete}
          >
            <Trash2 />
          </IconButton>
          <IconButton
            aria-label={`Editar ${transaction.description}`}
            onClick={onEdit}
          >
            <Pencil />
          </IconButton>
        </div>
      </td>
    </tr>
  )
}
