import type { Transaction } from '@prisma/client'

import { prisma } from '@/infra/db/prisma'
import type { TransactionType } from './create-transaction'

type UpdateTransactionInput = {
  description?: string | null
  amount?: number | null
  type?: TransactionType | null
  occurredAt?: Date | null
  categoryId?: string | null
}

export async function updateTransaction(
  id: string,
  data: UpdateTransactionInput,
  userId: string,
): Promise<Transaction> {
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  })
  if (!existing) throw new Error('Transação não encontrada')

  if (data.categoryId && data.categoryId !== existing.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, userId },
    })
    if (!category) throw new Error('Categoria não encontrada')
  }

  return prisma.transaction.update({
    where: { id },
    data: {
      description: data.description ?? undefined,
      amount: data.amount ?? undefined,
      type: data.type ?? undefined,
      occurredAt: data.occurredAt ?? undefined,
      categoryId: data.categoryId ?? undefined,
    },
  })
}
