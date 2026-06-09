import type { Transaction } from '@prisma/client'

import { prisma } from '@/infra/db/prisma'

export async function getTransaction(
  id: string,
  userId: string,
): Promise<Transaction> {
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
  })
  if (!transaction) throw new Error('Transação não encontrada')
  return transaction
}
