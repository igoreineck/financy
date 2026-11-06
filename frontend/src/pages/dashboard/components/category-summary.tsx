import { Tag, type TagColor } from '@/components/ui/tag'
import { formatCurrencyCents } from '@/lib/format'
import { isCategoryColor } from '@/pages/categories/color-map'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import type { CategoryAggregate } from '../hooks/use-category-aggregates'

type CategorySummaryProps = {
  aggregates: CategoryAggregate[]
  limit?: number
}

export function CategorySummary({
  aggregates,
  limit = 5,
}: CategorySummaryProps) {
  const top = aggregates.slice(0, limit)

  return (
    <section
      aria-label="Most used categories"
      className="flex flex-col rounded-xl border border-gray-200 bg-white"
    >
      <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Categories
        </h2>
        <Link
          to="/categories"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-base hover:text-brand-dark"
        >
          Gerenciar <ChevronRight className="size-3" />
        </Link>
      </header>

      {top.length === 0 ? (
        <p className="px-5 py-5 text-sm text-gray-500">
          No category activity this month.
        </p>
      ) : (
        <ul className="flex flex-col gap-4 px-5 py-5">
          {top.map(({ category, count, total }) => {
            const color: TagColor = isCategoryColor(category.color)
              ? category.color
              : 'gray'
            return (
              <li key={category.id} className="flex items-center gap-4">
                <Tag color={color} className="shrink-0">
                  {category.name}
                </Tag>
                <span className="ml-auto w-16 shrink-0 text-right text-xs text-gray-500">
                  {count} {count === 1 ? 'item' : 'items'}
                </span>
                <span className="shrink-0 text-sm font-semibold text-gray-800">
                  {formatCurrencyCents(total)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
