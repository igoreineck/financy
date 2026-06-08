import type { Category } from '@prisma/client'

import { prisma } from '@/infra/db/prisma'

type CreateCategoryInput = {
  name: string
  color: string
  icon: string
  description?: string | null
}

export async function createCategory(
  input: CreateCategoryInput,
  userId: string,
): Promise<Category> {
  return prisma.category.create({
    data: {
      name: input.name,
      color: input.color,
      icon: input.icon,
      description: input.description ?? null,
      userId,
    },
  })
}
