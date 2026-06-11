import { useMemo } from 'react'

type TransactionLike = {
  amount: number
  type: 'INCOME' | 'EXPENSE'
  occurredAt: string
}

export type MonthlySummary = {
  saldo: number
  receitas: number
  despesas: number
}

function isSameMonth(iso: string, reference: Date): boolean {
  const date = new Date(iso)
  return (
    date.getUTCFullYear() === reference.getUTCFullYear() &&
    date.getUTCMonth() === reference.getUTCMonth()
  )
}

export function useMonthlySummary(
  transactions: TransactionLike[],
  reference: Date = new Date(),
): MonthlySummary {
  return useMemo(() => {
    let receitas = 0
    let despesas = 0
    for (const t of transactions) {
      if (!isSameMonth(t.occurredAt, reference)) continue
      if (t.type === 'INCOME') receitas += t.amount
      else despesas += t.amount
    }
    return { saldo: receitas - despesas, receitas, despesas }
  }, [transactions, reference])
}
