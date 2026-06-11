import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useMonthlySummary } from './use-monthly-summary'

const reference = new Date('2025-11-15T00:00:00Z')

describe('useMonthlySummary', () => {
  it('returns zeros for an empty list', () => {
    const { result } = renderHook(() => useMonthlySummary([], reference))
    expect(result.current).toEqual({ saldo: 0, receitas: 0, despesas: 0 })
  })

  it('aggregates INCOME and EXPENSE inside the current month', () => {
    const { result } = renderHook(() =>
      useMonthlySummary(
        [
          {
            amount: 10_000,
            type: 'INCOME',
            occurredAt: '2025-11-02T00:00:00Z',
          },
          {
            amount: 2_500,
            type: 'EXPENSE',
            occurredAt: '2025-11-09T00:00:00Z',
          },
          { amount: 7_000, type: 'INCOME', occurredAt: '2025-11-20T00:00:00Z' },
          {
            amount: 4_000,
            type: 'EXPENSE',
            occurredAt: '2025-11-29T00:00:00Z',
          },
        ],
        reference,
      ),
    )
    expect(result.current).toEqual({
      receitas: 17_000,
      despesas: 6_500,
      saldo: 10_500,
    })
  })

  it('ignores transactions from previous months', () => {
    const { result } = renderHook(() =>
      useMonthlySummary(
        [
          { amount: 5_000, type: 'INCOME', occurredAt: '2025-10-30T00:00:00Z' },
          {
            amount: 9_000,
            type: 'EXPENSE',
            occurredAt: '2025-12-01T00:00:00Z',
          },
          { amount: 100, type: 'INCOME', occurredAt: '2025-11-15T00:00:00Z' },
        ],
        reference,
      ),
    )
    expect(result.current).toEqual({
      receitas: 100,
      despesas: 0,
      saldo: 100,
    })
  })

  it('preserves integer precision when summing cents', () => {
    const { result } = renderHook(() =>
      useMonthlySummary(
        [
          { amount: 1, type: 'INCOME', occurredAt: '2025-11-01T00:00:00Z' },
          { amount: 1, type: 'INCOME', occurredAt: '2025-11-02T00:00:00Z' },
          { amount: 1, type: 'INCOME', occurredAt: '2025-11-03T00:00:00Z' },
        ],
        reference,
      ),
    )
    expect(result.current.receitas).toBe(3)
    expect(result.current.saldo).toBe(3)
  })
})
