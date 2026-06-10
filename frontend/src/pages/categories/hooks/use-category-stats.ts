type CategoryLike = { id: string; name: string }
type TransactionLike = { categoryId: string }

export type CategoryStats = {
  totalCategories: number
  totalTransactions: number
  mostUsed: string | null
}

export function useCategoryStats(
  categories: CategoryLike[],
  transactions: TransactionLike[],
): CategoryStats {
  const totalCategories = categories.length
  const totalTransactions = transactions.length

  if (totalCategories === 0 || totalTransactions === 0) {
    return { totalCategories, totalTransactions, mostUsed: null }
  }

  const counts = new Map<string, number>()
  for (const t of transactions) {
    counts.set(t.categoryId, (counts.get(t.categoryId) ?? 0) + 1)
  }

  let topId: string | null = null
  let topCount = 0
  for (const [id, count] of counts) {
    if (count > topCount) {
      topId = id
      topCount = count
    }
  }

  const mostUsed = categories.find(c => c.id === topId)?.name ?? null

  return { totalCategories, totalTransactions, mostUsed }
}
