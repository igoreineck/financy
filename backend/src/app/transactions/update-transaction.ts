import { prisma } from '@/infra/db/prisma'
import type { TransactionWithCategory } from './create-transaction'
import type { TransactionType } from './transaction-type'

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
): Promise<TransactionWithCategory> {
  if (
    data.description === null ||
    data.amount === null ||
    data.type === null ||
    data.occurredAt === null ||
    data.categoryId === null
  ) {
    throw new Error('Campos obrigatórios não podem ser nulos')
  }

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
    include: { category: true },
  })
}
