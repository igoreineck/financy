import { prisma } from '@/infra/db/prisma'
import type { TransactionWithCategory } from './create-transaction'

export async function getTransaction(
  id: string,
  userId: string,
): Promise<TransactionWithCategory> {
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
    include: { category: true },
  })
  if (!transaction) throw new Error('Transaction not found')
  return transaction
}
