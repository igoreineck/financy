import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'

import { registerUser } from '@/app/auth/register-user'
import { createCategory } from './create-category'
import { listCategories } from './list-categories'

async function makeUser() {
  const { user } = await registerUser({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
  })
  return user
}

describe('listCategories', () => {
  it('returns only categories owned by the authenticated user', async () => {
    const userA = await makeUser()
    const userB = await makeUser()

    await createCategory(
      { name: 'Alimentação', color: '#FF5733', icon: 'utensils' },
      userA.id,
    )
    await createCategory(
      { name: 'Transporte', color: '#3366FF', icon: 'car' },
      userA.id,
    )
    await createCategory(
      { name: 'Saúde', color: '#FF0066', icon: 'heart' },
      userB.id,
    )

    const result = await listCategories(userA.id)

    expect(result).toHaveLength(2)
    expect(result.every(c => c.userId === userA.id)).toBe(true)
    expect(result.map(c => c.name)).not.toContain('Saúde')
  })

  it('orders results by name ascending', async () => {
    const user = await makeUser()

    await createCategory(
      { name: 'Casa', color: '#111111', icon: 'home' },
      user.id,
    )
    await createCategory(
      { name: 'Alimentação', color: '#222222', icon: 'utensils' },
      user.id,
    )
    await createCategory(
      { name: 'Beleza', color: '#333333', icon: 'sparkles' },
      user.id,
    )

    const result = await listCategories(user.id)

    expect(result.map(c => c.name)).toEqual(['Alimentação', 'Beleza', 'Casa'])
  })

  it('returns [] when user has no categories', async () => {
    const user = await makeUser()

    const result = await listCategories(user.id)

    expect(result).toEqual([])
  })
})
