type CategoryLike = { id: string; name: string; icon: string; color: string }
type TransactionLike = { categoryId: string }

export type MostUsedCategory = {
  name: string
  icon: string
  color: string
}

export type CategoryStats = {
  totalCategories: number
  totalTransactions: number
  mostUsed: MostUsedCategory | null
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

  const top = categories.find(c => c.id === topId)
  const mostUsed = top
    ? { name: top.name, icon: top.icon, color: top.color }
    : null

  return { totalCategories, totalTransactions, mostUsed }
}
