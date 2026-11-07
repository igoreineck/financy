import { Prisma } from '@prisma/client'

import { prisma } from '@/infra/db/prisma'

export async function deleteCategory(
  id: string,
  userId: string,
): Promise<boolean> {
  const existing = await prisma.category.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('Category not found')

  try {
    await prisma.category.delete({ where: { id } })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2003'
    ) {
      throw new Error(
        'Category has associated transactions and cannot be deleted',
      )
    }
    throw err
  }

  return true
}
