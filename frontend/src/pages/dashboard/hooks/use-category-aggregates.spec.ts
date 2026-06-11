import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCategoryAggregates } from './use-category-aggregates'

const reference = new Date('2025-11-15T00:00:00Z')

const categories = [
  { id: 'c1', name: 'Alimentação', color: 'orange', icon: 'utensils' },
  { id: 'c2', name: 'Transporte', color: 'blue', icon: 'car-front' },
  { id: 'c3', name: 'Lazer', color: 'purple', icon: 'ticket' },
]

describe('useCategoryAggregates', () => {
  it('groups by categoryId with count and total', () => {
    const { result } = renderHook(() =>
      useCategoryAggregates(
        [
          {
            amount: 1_000,
            type: 'EXPENSE',
            categoryId: 'c1',
            occurredAt: '2025-11-02T00:00:00Z',
          },
          {
            amount: 2_500,
            type: 'EXPENSE',
            categoryId: 'c1',
            occurredAt: '2025-11-09T00:00:00Z',
          },
          {
            amount: 4_000,
            type: 'EXPENSE',
            categoryId: 'c2',
            occurredAt: '2025-11-10T00:00:00Z',
          },
        ],
        categories,
        reference,
      ),
    )
    expect(result.current).toEqual([
      {
        category: categories[1],
        count: 1,
        total: 4_000,
      },
      {
        category: categories[0],
        count: 2,
        total: 3_500,
      },
    ])
  })

  it('orders aggregates by total descending', () => {
    const { result } = renderHook(() =>
      useCategoryAggregates(
        [
          {
            amount: 100,
            type: 'EXPENSE',
            categoryId: 'c1',
            occurredAt: '2025-11-01T00:00:00Z',
          },
          {
            amount: 5_000,
            type: 'EXPENSE',
            categoryId: 'c2',
            occurredAt: '2025-11-02T00:00:00Z',
          },
          {
            amount: 800,
            type: 'EXPENSE',
            categoryId: 'c3',
            occurredAt: '2025-11-03T00:00:00Z',
          },
        ],
        categories,
        reference,
      ),
    )
    expect(result.current.map(a => a.category.id)).toEqual(['c2', 'c3', 'c1'])
  })

  it('omits categories without transactions in the reference month', () => {
    const { result } = renderHook(() =>
      useCategoryAggregates(
        [
          {
            amount: 200,
            type: 'EXPENSE',
            categoryId: 'c1',
            occurredAt: '2025-11-01T00:00:00Z',
          },
        ],
        categories,
        reference,
      ),
    )
    expect(result.current).toHaveLength(1)
    expect(result.current[0].category.id).toBe('c1')
  })

  it('ignores transactions from other months', () => {
    const { result } = renderHook(() =>
      useCategoryAggregates(
        [
          {
            amount: 5_000,
            type: 'EXPENSE',
            categoryId: 'c1',
            occurredAt: '2025-10-30T00:00:00Z',
          },
          {
            amount: 1_000,
            type: 'EXPENSE',
            categoryId: 'c1',
            occurredAt: '2025-11-05T00:00:00Z',
          },
        ],
        categories,
        reference,
      ),
    )
    expect(result.current).toEqual([
      { category: categories[0], count: 1, total: 1_000 },
    ])
  })
})
