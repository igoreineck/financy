import { useEffect, useMemo, useState } from 'react'

export type PeriodFilter =
  | { kind: 'this-month' }
  | { kind: 'last-month' }
  | { kind: 'all' }
  | { kind: 'custom'; from?: string; to?: string }

export type TransactionFilters = {
  search: string
  type: 'ALL' | 'INCOME' | 'EXPENSE'
  categoryId: string
  period: PeriodFilter
}

export type FilterableTransaction = {
  id: string
  description: string
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
  occurredAt: string
}

export const ALL_CATEGORIES = 'ALL'

export const defaultFilters: TransactionFilters = {
  search: '',
  type: 'ALL',
  categoryId: ALL_CATEGORIES,
  period: { kind: 'all' },
}

export function useFilteredTransactions<T extends FilterableTransaction>(
  transactions: T[],
  filters: TransactionFilters,
  pageSize: number,
) {
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () => applyFilters(transactions, filters),
    [transactions, filters],
  )

  const filtersKey = JSON.stringify(filters)
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset only when filters change
  useEffect(() => {
    setPage(1)
  }, [filtersKey])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  return { rows, total, totalPages, page: safePage, setPage }
}

function applyFilters<T extends FilterableTransaction>(
  transactions: T[],
  filters: TransactionFilters,
): T[] {
  const now = new Date()
  const search = filters.search.trim().toLowerCase()
  const period = filters.period

  const thisMonthYear = now.getUTCFullYear()
  const thisMonth = now.getUTCMonth()
  const lastMonthDate = new Date(Date.UTC(thisMonthYear, thisMonth - 1, 1))
  const lastMonthYear = lastMonthDate.getUTCFullYear()
  const lastMonth = lastMonthDate.getUTCMonth()

  return transactions.filter(transaction => {
    if (search && !transaction.description.toLowerCase().includes(search)) {
      return false
    }
    if (filters.type !== 'ALL' && transaction.type !== filters.type) {
      return false
    }
    if (
      filters.categoryId !== ALL_CATEGORIES &&
      transaction.categoryId !== filters.categoryId
    ) {
      return false
    }

    if (period.kind === 'all') return true

    const occurredAt = new Date(transaction.occurredAt)
    if (period.kind === 'this-month') {
      return (
        occurredAt.getUTCFullYear() === thisMonthYear &&
        occurredAt.getUTCMonth() === thisMonth
      )
    }
    if (period.kind === 'last-month') {
      return (
        occurredAt.getUTCFullYear() === lastMonthYear &&
        occurredAt.getUTCMonth() === lastMonth
      )
    }
    if (period.from) {
      const from = new Date(`${period.from}T00:00:00Z`)
      if (occurredAt < from) return false
    }
    if (period.to) {
      const to = new Date(`${period.to}T23:59:59.999Z`)
      if (occurredAt > to) return false
    }
    return true
  })
}
