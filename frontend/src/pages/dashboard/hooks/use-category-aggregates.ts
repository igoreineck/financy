import { useMemo } from 'react'

type CategoryLike = {
  id: string
  name: string
  color: string
  icon: string
}

type TransactionLike = {
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
  occurredAt: string
}

export type CategoryAggregate = {
  category: CategoryLike
  count: number
  total: number
}

function isSameMonth(iso: string, reference: Date): boolean {
  const date = new Date(iso)
  return (
    date.getUTCFullYear() === reference.getUTCFullYear() &&
    date.getUTCMonth() === reference.getUTCMonth()
  )
}

export function useCategoryAggregates(
  transactions: TransactionLike[],
  categories: CategoryLike[],
  reference: Date = new Date(),
): CategoryAggregate[] {
  return useMemo(() => {
    const byId = new Map<string, { count: number; total: number }>()
    for (const t of transactions) {
      if (!isSameMonth(t.occurredAt, reference)) continue
      const entry = byId.get(t.categoryId) ?? { count: 0, total: 0 }
      entry.count += 1
      entry.total += t.amount
      byId.set(t.categoryId, entry)
    }

    const aggregates: CategoryAggregate[] = []
    for (const category of categories) {
      const entry = byId.get(category.id)
      if (!entry) continue
      aggregates.push({ category, count: entry.count, total: entry.total })
    }

    aggregates.sort((a, b) => b.total - a.total)
    return aggregates
  }, [transactions, categories, reference])
}
