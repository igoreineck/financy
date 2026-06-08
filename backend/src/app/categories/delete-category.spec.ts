import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'

import { registerUser } from '@/app/auth/register-user'
import { prisma } from '@/infra/db/prisma'
import { createCategory } from './create-category'
import { deleteCategory } from './delete-category'

async function makeUser() {
  const { user } = await registerUser({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
  })
  return user
}

describe('deleteCategory', () => {
  it('removes a category without linked transactions', async () => {
    const user = await makeUser()
    const category = await createCategory(
      { name: 'Lazer', color: '#22BB55', icon: 'gamepad' },
      user.id,
    )

    const result = await deleteCategory(category.id, user.id)

    expect(result).toBe(true)
    const found = await prisma.category.findUnique({
      where: { id: category.id },
    })
    expect(found).toBeNull()
  })

  it('throws when the id does not exist', async () => {
    const user = await makeUser()

    await expect(deleteCategory(faker.string.uuid(), user.id)).rejects.toThrow(
      'Categoria não encontrada',
    )
  })

  it('throws when the category belongs to another user', async () => {
    const userA = await makeUser()
    const userB = await makeUser()
    const fromA = await createCategory(
      { name: 'Privada', color: '#000', icon: 'lock' },
      userA.id,
    )

    await expect(deleteCategory(fromA.id, userB.id)).rejects.toThrow(
      'Categoria não encontrada',
    )

    const stillThere = await prisma.category.findUnique({
      where: { id: fromA.id },
    })
    expect(stillThere).not.toBeNull()
  })
})
