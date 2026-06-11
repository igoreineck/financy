import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type FilterableTransaction,
  type TransactionFilters,
  defaultFilters,
  useFilteredTransactions,
} from './use-filtered-transactions'

function makeTransactions(): FilterableTransaction[] {
  return [
    {
      id: 't1',
      description: 'Mercado',
      type: 'EXPENSE',
      categoryId: 'c1',
      occurredAt: '2025-11-02T10:00:00Z',
    },
    {
      id: 't2',
      description: 'Salário',
      type: 'INCOME',
      categoryId: 'c2',
      occurredAt: '2025-11-05T10:00:00Z',
    },
    {
      id: 't3',
      description: 'Uber',
      type: 'EXPENSE',
      categoryId: 'c3',
      occurredAt: '2025-10-20T10:00:00Z',
    },
  ]
}

describe('useFilteredTransactions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-11-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('recomputes total when filters change', () => {
    const transactions = makeTransactions()
    const { result, rerender } = renderHook(
      ({ filters }: { filters: TransactionFilters }) =>
        useFilteredTransactions(transactions, filters, 10),
      { initialProps: { filters: defaultFilters } },
    )

    expect(result.current.total).toBe(3)

    rerender({ filters: { ...defaultFilters, type: 'EXPENSE' } })
    expect(result.current.total).toBe(2)

    rerender({
      filters: { ...defaultFilters, search: 'sal' },
    })
    expect(result.current.total).toBe(1)
    expect(result.current.rows[0]?.description).toBe('Salário')
  })

  it('respects pagination across filtered results', () => {
    const transactions: FilterableTransaction[] = Array.from(
      { length: 25 },
      (_, i) => ({
        id: `t${i + 1}`,
        description: i % 2 === 0 ? `Compra ${i}` : `Receita ${i}`,
        type: i % 2 === 0 ? 'EXPENSE' : 'INCOME',
        categoryId: 'c1',
        occurredAt: '2025-11-10T10:00:00Z',
      }),
    )

    const { result, rerender } = renderHook(
      ({ filters }: { filters: TransactionFilters }) =>
        useFilteredTransactions(transactions, filters, 10),
      { initialProps: { filters: defaultFilters } },
    )

    expect(result.current.total).toBe(25)
    expect(result.current.totalPages).toBe(3)
    expect(result.current.rows).toHaveLength(10)

    act(() => result.current.setPage(3))
    expect(result.current.rows).toHaveLength(5)

    rerender({ filters: { ...defaultFilters, type: 'EXPENSE' } })
    expect(result.current.total).toBe(13)
    expect(result.current.totalPages).toBe(2)
    expect(result.current.page).toBe(1)
  })

  it('resets to page 1 when a filter changes', () => {
    const transactions: FilterableTransaction[] = Array.from(
      { length: 30 },
      (_, i) => ({
        id: `t${i + 1}`,
        description: `Compra ${i}`,
        type: 'EXPENSE',
        categoryId: 'c1',
        occurredAt: '2025-11-10T10:00:00Z',
      }),
    )

    const { result, rerender } = renderHook(
      ({ filters }: { filters: TransactionFilters }) =>
        useFilteredTransactions(transactions, filters, 10),
      { initialProps: { filters: defaultFilters } },
    )

    act(() => result.current.setPage(3))
    expect(result.current.page).toBe(3)

    rerender({ filters: { ...defaultFilters, search: 'Compra' } })
    expect(result.current.page).toBe(1)
  })

  it('filters by "this month" using UTC reference', () => {
    const transactions = makeTransactions()
    const { result } = renderHook(() =>
      useFilteredTransactions(
        transactions,
        { ...defaultFilters, period: { kind: 'this-month' } },
        10,
      ),
    )
    expect(result.current.total).toBe(2)
    expect(result.current.rows.map(r => r.id)).toEqual(['t1', 't2'])
  })

  it('filters by "last month"', () => {
    const transactions = makeTransactions()
    const { result } = renderHook(() =>
      useFilteredTransactions(
        transactions,
        { ...defaultFilters, period: { kind: 'last-month' } },
        10,
      ),
    )
    expect(result.current.total).toBe(1)
    expect(result.current.rows[0]?.id).toBe('t3')
  })

  it('filters by a custom date range', () => {
    const transactions = makeTransactions()
    const { result } = renderHook(() =>
      useFilteredTransactions(
        transactions,
        {
          ...defaultFilters,
          period: {
            kind: 'custom',
            from: '2025-10-15',
            to: '2025-11-03',
          },
        },
        10,
      ),
    )
    expect(result.current.rows.map(r => r.id)).toEqual(['t1', 't3'])
  })

  it('combines filters as AND', () => {
    const transactions = makeTransactions()
    const { result } = renderHook(() =>
      useFilteredTransactions(
        transactions,
        {
          search: 'a',
          type: 'EXPENSE',
          categoryId: 'c1',
          period: { kind: 'this-month' },
        },
        10,
      ),
    )
    expect(result.current.rows.map(r => r.id)).toEqual(['t1'])
  })
})
