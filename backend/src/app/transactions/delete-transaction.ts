import { prisma } from '@/infra/db/prisma'

export async function deleteTransaction(
  id: string,
  userId: string,
): Promise<boolean> {
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  })
  if (!existing) throw new Error('Transação não encontrada')

  await prisma.transaction.delete({ where: { id } })
  return true
}
