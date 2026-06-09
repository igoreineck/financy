import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'

import { registerUser } from '@/app/auth/register-user'
import { createCategory } from '@/app/categories/create-category'
import { createTransaction } from './create-transaction'
import { listTransactions } from './list-transactions'

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

describe('listTransactions', () => {
  it('returns only the authenticated user transactions', async () => {
    const userA = await makeUser()
    const userB = await makeUser()
    const categoryA = await makeCategory(userA.id)
    const categoryB = await makeCategory(userB.id)

    await createTransaction(
      {
        description: 'A1',
        amount: 100,
        type: 'EXPENSE',
        occurredAt: new Date('2026-06-01T12:00:00.000Z'),
        categoryId: categoryA.id,
      },
      userA.id,
    )
    await createTransaction(
      {
        description: 'B1',
        amount: 200,
        type: 'INCOME',
        occurredAt: new Date('2026-06-02T12:00:00.000Z'),
        categoryId: categoryB.id,
      },
      userB.id,
    )

    const list = await listTransactions(userA.id)

    expect(list).toHaveLength(1)
    expect(list[0]?.description).toBe('A1')
    expect(list[0]?.userId).toBe(userA.id)
  })

  it('orders results by occurredAt desc', async () => {
    const user = await makeUser()
    const category = await makeCategory(user.id)

    await createTransaction(
      {
        description: 'oldest',
        amount: 100,
        type: 'EXPENSE',
        occurredAt: new Date('2026-01-01T12:00:00.000Z'),
        categoryId: category.id,
      },
      user.id,
    )
    await createTransaction(
      {
        description: 'newest',
        amount: 300,
        type: 'EXPENSE',
        occurredAt: new Date('2026-06-01T12:00:00.000Z'),
        categoryId: category.id,
      },
      user.id,
    )
    await createTransaction(
      {
        description: 'middle',
        amount: 200,
        type: 'EXPENSE',
        occurredAt: new Date('2026-03-01T12:00:00.000Z'),
        categoryId: category.id,
      },
      user.id,
    )

    const list = await listTransactions(user.id)

    expect(list.map(t => t.description)).toEqual(['newest', 'middle', 'oldest'])
  })

  it('returns an empty array when the user has no transactions', async () => {
    const user = await makeUser()

    const list = await listTransactions(user.id)

    expect(list).toEqual([])
  })
})
