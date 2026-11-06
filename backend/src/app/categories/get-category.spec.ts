import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'

import { registerUser } from '@/app/auth/register-user'
import { createCategory } from './create-category'
import { getCategory } from './get-category'

async function makeUser() {
  const { user } = await registerUser({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
  })
  return user
}

describe('getCategory', () => {
  it('returns the category owned by the user', async () => {
    const user = await makeUser()
    const created = await createCategory(
      { name: 'Alimentação', color: '#FF5733', icon: 'utensils' },
      user.id,
    )

    const found = await getCategory(created.id, user.id)

    expect(found.id).toBe(created.id)
    expect(found.name).toBe('Alimentação')
  })

  it('throws when the id does not exist', async () => {
    const user = await makeUser()

    await expect(getCategory(faker.string.uuid(), user.id)).rejects.toThrow(
      'Category not found',
    )
  })

  it('throws when the category belongs to another user', async () => {
    const owner = await makeUser()
    const attacker = await makeUser()
    const category = await createCategory(
      { name: 'Privada', color: '#000', icon: 'lock' },
      owner.id,
    )

    await expect(getCategory(category.id, attacker.id)).rejects.toThrow(
      'Category not found',
    )
  })
})
