import type { Category } from '@prisma/client'

import { prisma } from '@/infra/db/prisma'

export async function getCategory(
  id: string,
  userId: string,
): Promise<Category> {
  const category = await prisma.category.findFirst({
    where: { id, userId },
  })
  if (!category) throw new Error('Categoria não encontrada')
  return category
}
