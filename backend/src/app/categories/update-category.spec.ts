import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'

import { registerUser } from '@/app/auth/register-user'
import { createCategory } from './create-category'
import { updateCategory } from './update-category'

async function makeUser() {
  const { user } = await registerUser({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
  })
  return user
}

describe('updateCategory', () => {
  it('update parcial preserva campos não enviados', async () => {
    const user = await makeUser()
    const original = await createCategory(
      {
        name: 'Alimentação',
        color: '#FF5733',
        icon: 'utensils',
        description: 'Mercado',
      },
      user.id,
    )

    const updated = await updateCategory(
      original.id,
      { name: 'Comida' },
      user.id,
    )

    expect(updated.name).toBe('Comida')
    expect(updated.color).toBe('#FF5733')
    expect(updated.icon).toBe('utensils')
    expect(updated.description).toBe('Mercado')
  })

  it('description = null limpa o campo', async () => {
    const user = await makeUser()
    const original = await createCategory(
      {
        name: 'Lazer',
        color: '#22BB55',
        icon: 'gamepad',
        description: 'Jogos',
      },
      user.id,
    )

    const updated = await updateCategory(
      original.id,
      { description: null },
      user.id,
    )

    expect(updated.description).toBeNull()
  })

  it('id de outro usuário → Categoria não encontrada', async () => {
    const userA = await makeUser()
    const userB = await makeUser()
    const fromA = await createCategory(
      { name: 'Privada', color: '#000', icon: 'lock' },
      userA.id,
    )

    await expect(
      updateCategory(fromA.id, { name: 'Hackeada' }, userB.id),
    ).rejects.toThrow('Categoria não encontrada')
  })

  it('updatedAt é atualizado', async () => {
    const user = await makeUser()
    const original = await createCategory(
      { name: 'Casa', color: '#111', icon: 'home' },
      user.id,
    )

    await new Promise(resolve => setTimeout(resolve, 10))

    const updated = await updateCategory(
      original.id,
      { name: 'Casa nova' },
      user.id,
    )

    expect(updated.updatedAt.getTime()).toBeGreaterThan(
      original.updatedAt.getTime(),
    )
  })
})
