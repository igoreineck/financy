import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'

import { registerUser } from '@/app/auth/register-user'
import { prisma } from '@/infra/db/prisma'
import { createCategory } from './create-category'

async function makeUser() {
  const { user } = await registerUser({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
  })
  return user
}

describe('createCategory', () => {
  it('cria categoria e retorna objeto com userId correto', async () => {
    const user = await makeUser()

    const category = await createCategory(
      {
        name: 'Alimentação',
        color: '#FF5733',
        icon: 'utensils',
        description: 'Mercado e restaurantes',
      },
      user.id,
    )

    expect(category.id).toEqual(expect.any(String))
    expect(category.userId).toBe(user.id)
    expect(category.name).toBe('Alimentação')
    expect(category.color).toBe('#FF5733')
    expect(category.icon).toBe('utensils')
    expect(category.description).toBe('Mercado e restaurantes')

    const stored = await prisma.category.findUniqueOrThrow({
      where: { id: category.id },
    })
    expect(stored.userId).toBe(user.id)
  })

  it('description opcional vira null quando ausente', async () => {
    const user = await makeUser()

    const category = await createCategory(
      {
        name: 'Transporte',
        color: '#3366FF',
        icon: 'car',
      },
      user.id,
    )

    expect(category.description).toBeNull()
  })
})
