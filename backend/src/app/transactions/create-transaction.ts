import type { Category, Transaction } from '@prisma/client'

import { prisma } from '@/infra/db/prisma'
import type { TransactionType } from './transaction-type'

type CreateTransactionInput = {
  description: string
  amount: number
  type: TransactionType
  occurredAt: Date
  categoryId: string
}

export type TransactionWithCategory = Transaction & { category: Category }

export async function createTransaction(
  input: CreateTransactionInput,
  userId: string,
): Promise<TransactionWithCategory> {
  const category = await prisma.category.findFirst({
    where: { id: input.categoryId, userId },
  })
  if (!category) throw new Error('Category not found')

  return prisma.transaction.create({
    data: {
      description: input.description,
      amount: input.amount,
      type: input.type,
      occurredAt: input.occurredAt,
      categoryId: input.categoryId,
      userId,
    },
    include: { category: true },
  })
}
