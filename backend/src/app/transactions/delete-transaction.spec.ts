import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'

import { registerUser } from '@/app/auth/register-user'
import { createCategory } from '@/app/categories/create-category'
import { prisma } from '@/infra/db/prisma'
import { createTransaction } from './create-transaction'
import { deleteTransaction } from './delete-transaction'

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

describe('deleteTransaction', () => {
  it('removes the transaction owned by the user', async () => {
    const user = await makeUser()
    const category = await makeCategory(user.id)
    const transaction = await makeTransaction(user.id, category.id)

    const result = await deleteTransaction(transaction.id, user.id)

    expect(result).toBe(true)
    const found = await prisma.transaction.findUnique({
      where: { id: transaction.id },
    })
    expect(found).toBeNull()
  })

  it('throws when the id does not exist', async () => {
    const user = await makeUser()

    await expect(
      deleteTransaction(faker.string.uuid(), user.id),
    ).rejects.toThrow('Transação não encontrada')
  })

  it('throws when the transaction belongs to another user', async () => {
    const owner = await makeUser()
    const attacker = await makeUser()
    const category = await makeCategory(owner.id)
    const transaction = await makeTransaction(owner.id, category.id)

    await expect(
      deleteTransaction(transaction.id, attacker.id),
    ).rejects.toThrow('Transação não encontrada')

    const stillThere = await prisma.transaction.findUnique({
      where: { id: transaction.id },
    })
    expect(stillThere).not.toBeNull()
  })
})
