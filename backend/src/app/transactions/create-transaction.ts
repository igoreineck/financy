import type { Transaction } from '@prisma/client'

import { prisma } from '@/infra/db/prisma'

export type TransactionType = 'INCOME' | 'EXPENSE'

type CreateTransactionInput = {
  description: string
  amount: number
  type: TransactionType
  occurredAt: Date
  categoryId: string
}

export async function createTransaction(
  input: CreateTransactionInput,
  userId: string,
): Promise<Transaction> {
  const category = await prisma.category.findFirst({
    where: { id: input.categoryId, userId },
  })
  if (!category) throw new Error('Categoria não encontrada')

  return prisma.transaction.create({
    data: {
      description: input.description,
      amount: input.amount,
      type: input.type,
      occurredAt: input.occurredAt,
      categoryId: input.categoryId,
      userId,
    },
  })
}
