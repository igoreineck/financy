import { Tag, type TagColor } from '@/components/ui/tag'
import { formatCurrencyCents, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { iconBgClassFor, isCategoryColor } from '@/pages/categories/color-map'
import { iconMap, isCategoryIcon } from '@/pages/categories/icon-map'

export type RecentTransaction = {
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

type RecentTransactionsProps = {
  transactions: RecentTransaction[]
  limit?: number
}

export function RecentTransactions({
  transactions,
  limit = 5,
}: RecentTransactionsProps) {
  const sorted = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    )
    .slice(0, limit)

  return (
    <section
      aria-label="Transações recentes"
      className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5"
    >
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">
          Transações recentes
        </h2>
      </header>

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma transação por aqui.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-200">
          {sorted.map(transaction => (
            <li
              key={transaction.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <CategoryIcon transaction={transaction} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-gray-800">
                  {transaction.description}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(transaction.occurredAt)}
                </span>
              </div>
              <CategoryTag transaction={transaction} />
              <span
                className={cn(
                  'shrink-0 text-sm font-semibold',
                  transaction.type === 'INCOME'
                    ? 'text-success'
                    : 'text-danger',
                )}
              >
                {transaction.type === 'INCOME' ? '+' : '-'}{' '}
                {formatCurrencyCents(transaction.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function CategoryIcon({ transaction }: { transaction: RecentTransaction }) {
  const color: TagColor = isCategoryColor(transaction.category.color)
    ? transaction.category.color
    : 'gray'
  const Icon = isCategoryIcon(transaction.category.icon)
    ? iconMap[transaction.category.icon]
    : null
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-lg',
        iconBgClassFor(color),
      )}
    >
      {Icon ? <Icon className="size-5" /> : null}
    </span>
  )
}

function CategoryTag({ transaction }: { transaction: RecentTransaction }) {
  const color: TagColor = isCategoryColor(transaction.category.color)
    ? transaction.category.color
    : 'gray'
  return (
    <Tag color={color} className="hidden sm:inline-flex">
      {transaction.category.name}
    </Tag>
  )
}
