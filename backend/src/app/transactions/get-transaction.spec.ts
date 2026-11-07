import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'

import { registerUser } from '@/app/auth/register-user'
import { createCategory } from '@/app/categories/create-category'
import { createTransaction } from './create-transaction'
import { getTransaction } from './get-transaction'

async function makeUser() {
  const { user } = await registerUser({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
  })
  return user
}

async function makeCategory(userId: string) {
  return createCategory(
    {
      name: faker.commerce.department(),
      color: '#FF5733',
      icon: 'utensils',
    },
    userId,
  )
}

async function makeTransaction(userId: string, categoryId: string) {
  return createTransaction(
    {
      description: 'Almoço',
      amount: 1234,
      type: 'EXPENSE',
      occurredAt: new Date('2026-06-01T12:00:00.000Z'),
      categoryId,
    },
    userId,
  )
}

describe('getTransaction', () => {
  it('returns the transaction owned by the user', async () => {
    const user = await makeUser()
    const category = await makeCategory(user.id)
    const created = await makeTransaction(user.id, category.id)

    const found = await getTransaction(created.id, user.id)

    expect(found.id).toBe(created.id)
    expect(found.description).toBe('Almoço')
    expect(found.amount).toBe(1234)
  })

  it('throws when the id does not exist', async () => {
    const user = await makeUser()

    await expect(getTransaction(faker.string.uuid(), user.id)).rejects.toThrow(
      'Transaction not found',
    )
  })

  it('throws when the transaction belongs to another user', async () => {
    const owner = await makeUser()
    const attacker = await makeUser()
    const category = await makeCategory(owner.id)
    const transaction = await makeTransaction(owner.id, category.id)

    await expect(getTransaction(transaction.id, attacker.id)).rejects.toThrow(
      'Transaction not found',
    )
  })
})
