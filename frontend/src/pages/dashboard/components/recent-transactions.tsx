import { Tag, type TagColor } from '@/components/ui/tag'
import { formatCurrencyCents, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { iconBgClassFor, isCategoryColor } from '@/pages/categories/color-map'
import { iconMap, isCategoryIcon } from '@/pages/categories/icon-map'
import {
  ChevronRight,
  CircleArrowDown,
  CircleArrowUp,
  Plus,
} from 'lucide-react'
import { Link } from 'react-router'

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
  onCreate?: () => void
}

export function RecentTransactions({
  transactions,
  limit = 5,
  onCreate,
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
      className="flex flex-col rounded-xl border border-gray-200 bg-white"
    >
      <header className="flex items-center justify-between px-5 py-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Transações recentes
        </h2>
        <Link
          to="/transacoes"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-base hover:text-brand-dark"
        >
          Ver todas <ChevronRight className="size-3" />
        </Link>
      </header>

      {sorted.length === 0 ? (
        <p className="border-t border-gray-200 px-5 py-6 text-sm text-gray-500">
          Nenhuma transação por aqui.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-200 border-t border-gray-200">
          {sorted.map(transaction => (
            <li
              key={transaction.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 sm:grid-cols-[auto_1fr_8rem_9rem]"
            >
              <CategoryIcon transaction={transaction} />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-sm font-medium text-gray-800">
                  {transaction.description}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(transaction.occurredAt)}
                </span>
              </div>
              <div className="hidden justify-self-center sm:block">
                <CategoryTag transaction={transaction} />
              </div>
              <div className="justify-self-end">
                <AmountWithArrow transaction={transaction} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onCreate}
        className="flex items-center justify-center gap-2 border-t border-gray-200 px-5 py-3 text-sm font-medium text-brand-base transition-colors hover:bg-gray-100"
      >
        <Plus className="size-4" /> Nova transação
      </button>
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
        'flex size-9 shrink-0 items-center justify-center rounded-lg',
        iconBgClassFor(color),
      )}
    >
      {Icon ? <Icon className="size-4" /> : null}
    </span>
  )
}

function CategoryTag({ transaction }: { transaction: RecentTransaction }) {
  const color: TagColor = isCategoryColor(transaction.category.color)
    ? transaction.category.color
    : 'gray'
  return <Tag color={color}>{transaction.category.name}</Tag>
}

function AmountWithArrow({ transaction }: { transaction: RecentTransaction }) {
  const isIncome = transaction.type === 'INCOME'
  const Arrow = isIncome ? CircleArrowUp : CircleArrowDown
  return (
    <span className="inline-flex shrink-0 items-center gap-3 text-sm font-semibold text-gray-800">
      {isIncome ? '+' : '-'} {formatCurrencyCents(transaction.amount)}
      <Arrow
        className={cn('size-4', isIncome ? 'text-success' : 'text-danger')}
        aria-hidden="true"
      />
    </span>
  )
}
