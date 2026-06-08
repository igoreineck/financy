import type { Category } from '@prisma/client'

import { prisma } from '@/infra/db/prisma'

export async function listCategories(userId: string): Promise<Category[]> {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  })
}
