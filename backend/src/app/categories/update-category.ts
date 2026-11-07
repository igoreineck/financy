import type { Category } from '@prisma/client'

import { prisma } from '@/infra/db/prisma'

type UpdateCategoryInput = {
  name?: string | null
  color?: string | null
  icon?: string | null
  description?: string | null
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryInput,
  userId: string,
): Promise<Category> {
  if (data.name === null || data.color === null || data.icon === null) {
    throw new Error('Name, color, and icon cannot be null')
  }

  const existing = await prisma.category.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('Category not found')

  return prisma.category.update({
    where: { id },
    data: {
      name: data.name ?? undefined,
      color: data.color ?? undefined,
      icon: data.icon ?? undefined,
      description: data.description,
    },
  })
}
