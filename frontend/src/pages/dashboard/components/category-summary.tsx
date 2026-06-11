import type { TagColor } from '@/components/ui/tag'
import { formatCurrencyCents } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  iconBgClassFor,
  isCategoryColor,
  swatchClassFor,
} from '@/pages/categories/color-map'
import { iconMap, isCategoryIcon } from '@/pages/categories/icon-map'
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
      aria-label="Categorias mais usadas"
      className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5"
    >
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">
          Categorias mais usadas
        </h2>
      </header>

      {top.length === 0 ? (
        <p className="text-sm text-gray-500">
          Sem categorias movimentadas neste mês.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-200">
          {top.map(({ category, count, total }) => {
            const color: TagColor = isCategoryColor(category.color)
              ? category.color
              : 'gray'
            const Icon = isCategoryIcon(category.icon)
              ? iconMap[category.icon]
              : null
            return (
              <li
                key={category.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-lg',
                    iconBgClassFor(color),
                  )}
                >
                  {Icon ? <Icon className="size-5" /> : null}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'size-2 shrink-0 rounded-full',
                        swatchClassFor(color),
                      )}
                    />
                    <span className="truncate text-sm font-medium text-gray-800">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {count} {count === 1 ? 'item' : 'itens'}
                  </span>
                </div>
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
