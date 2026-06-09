import { prisma } from '@/infra/db/prisma'
import type { TransactionWithCategory } from './create-transaction'

export async function listTransactions(
  userId: string,
): Promise<TransactionWithCategory[]> {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { occurredAt: 'desc' },
    include: { category: true },
  })
}
