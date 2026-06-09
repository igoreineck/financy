import type { Transaction } from '@prisma/client'

import { prisma } from '@/infra/db/prisma'

export async function listTransactions(userId: string): Promise<Transaction[]> {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { occurredAt: 'desc' },
  })
}
