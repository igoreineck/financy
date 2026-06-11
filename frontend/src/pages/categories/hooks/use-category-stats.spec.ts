import { describe, expect, it } from 'vitest'
import { useCategoryStats } from './use-category-stats'

const categories = [
  { id: 'c1', name: 'Alimentação', icon: 'utensils', color: 'orange' },
  { id: 'c2', name: 'Transporte', icon: 'car-front', color: 'blue' },
  { id: 'c3', name: 'Lazer', icon: 'ticket', color: 'purple' },
]

describe('useCategoryStats', () => {
  it('returns zeros when inputs are empty', () => {
    expect(useCategoryStats([], [])).toEqual({
      totalCategories: 0,
      totalTransactions: 0,
      mostUsed: null,
    })
  })

  it('counts categories even with no transactions', () => {
    expect(useCategoryStats(categories, [])).toEqual({
      totalCategories: 3,
      totalTransactions: 0,
      mostUsed: null,
    })
  })

  it('returns the category with the most transactions', () => {
    const transactions = [
      { categoryId: 'c1' },
      { categoryId: 'c1' },
      { categoryId: 'c2' },
      { categoryId: 'c1' },
      { categoryId: 'c3' },
    ]
    expect(useCategoryStats(categories, transactions)).toEqual({
      totalCategories: 3,
      totalTransactions: 5,
      mostUsed: { name: 'Alimentação', icon: 'utensils', color: 'orange' },
    })
  })

  it('returns null mostUsed when the top categoryId no longer exists', () => {
    const transactions = [{ categoryId: 'ghost' }, { categoryId: 'ghost' }]
    expect(useCategoryStats(categories, transactions).mostUsed).toBe(null)
  })
})
