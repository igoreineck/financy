import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'

import { registerUser } from '@/app/auth/register-user'
import { createCategory } from '@/app/categories/create-category'
import { prisma } from '@/infra/db/prisma'
import { createTransaction } from './create-transaction'

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

describe('createTransaction', () => {
  it('creates a transaction with valid input and the user category', async () => {
    const user = await makeUser()
    const category = await makeCategory(user.id)
    const occurredAt = new Date('2026-06-08T12:00:00.000Z')

    const transaction = await createTransaction(
      {
        description: 'Almoço',
        amount: 1234,
        type: 'EXPENSE',
        occurredAt,
        categoryId: category.id,
      },
      user.id,
    )

    expect(transaction.id).toEqual(expect.any(String))
    expect(transaction.userId).toBe(user.id)
    expect(transaction.categoryId).toBe(category.id)
    expect(transaction.description).toBe('Almoço')
    expect(transaction.amount).toBe(1234)
    expect(transaction.type).toBe('EXPENSE')
    expect(transaction.occurredAt).toEqual(occurredAt)

    const stored = await prisma.transaction.findUniqueOrThrow({
      where: { id: transaction.id },
    })
    expect(stored.userId).toBe(user.id)
    expect(stored.amount).toBe(1234)
  })

  it('stores amount as an integer in cents', async () => {
    const user = await makeUser()
    const category = await makeCategory(user.id)

    const transaction = await createTransaction(
      {
        description: 'Salário',
        amount: 500000,
        type: 'INCOME',
        occurredAt: new Date(),
        categoryId: category.id,
      },
      user.id,
    )

    expect(Number.isInteger(transaction.amount)).toBe(true)
    expect(transaction.amount).toBe(500000)
  })

  it('rejects categoryId owned by another user with "Category not found"', async () => {
    const owner = await makeUser()
    const attacker = await makeUser()
    const category = await makeCategory(owner.id)

    await expect(
      createTransaction(
        {
          description: 'Tentativa',
          amount: 100,
          type: 'EXPENSE',
          occurredAt: new Date(),
          categoryId: category.id,
        },
        attacker.id,
      ),
    ).rejects.toThrow('Category not found')

    const count = await prisma.transaction.count()
    expect(count).toBe(0)
  })

  it('rejects nonexistent categoryId with "Category not found"', async () => {
    const user = await makeUser()

    await expect(
      createTransaction(
        {
          description: 'Fantasma',
          amount: 100,
          type: 'EXPENSE',
          occurredAt: new Date(),
          categoryId: 'does-not-exist',
        },
        user.id,
      ),
    ).rejects.toThrow('Category not found')
  })
})
