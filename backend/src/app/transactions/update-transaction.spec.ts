import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'

import { registerUser } from '@/app/auth/register-user'
import { createCategory } from '@/app/categories/create-category'
import { createTransaction } from './create-transaction'
import { updateTransaction } from './update-transaction'

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

describe('updateTransaction', () => {
  it('partial update only changes the sent field', async () => {
    const user = await makeUser()
    const category = await makeCategory(user.id)
    const original = await makeTransaction(user.id, category.id)

    const updated = await updateTransaction(
      original.id,
      { description: 'Janta' },
      user.id,
    )

    expect(updated.description).toBe('Janta')
    expect(updated.amount).toBe(original.amount)
    expect(updated.type).toBe(original.type)
    expect(updated.occurredAt).toEqual(original.occurredAt)
    expect(updated.categoryId).toBe(original.categoryId)
  })

  it('accepts amount: 0 as a real value', async () => {
    const user = await makeUser()
    const category = await makeCategory(user.id)
    const original = await makeTransaction(user.id, category.id)

    const updated = await updateTransaction(original.id, { amount: 0 }, user.id)

    expect(updated.amount).toBe(0)
  })

  it('rejects update on another user transaction with "Transação não encontrada"', async () => {
    const owner = await makeUser()
    const attacker = await makeUser()
    const category = await makeCategory(owner.id)
    const transaction = await makeTransaction(owner.id, category.id)

    await expect(
      updateTransaction(transaction.id, { amount: 1 }, attacker.id),
    ).rejects.toThrow('Transação não encontrada')
  })

  it('rejects categoryId owned by another user with "Categoria não encontrada"', async () => {
    const user = await makeUser()
    const attacker = await makeUser()
    const ownCategory = await makeCategory(user.id)
    const otherCategory = await makeCategory(attacker.id)
    const transaction = await makeTransaction(user.id, ownCategory.id)

    await expect(
      updateTransaction(
        transaction.id,
        { categoryId: otherCategory.id },
        user.id,
      ),
    ).rejects.toThrow('Categoria não encontrada')
  })

  it('bumps updatedAt on change', async () => {
    const user = await makeUser()
    const category = await makeCategory(user.id)
    const original = await makeTransaction(user.id, category.id)

    await new Promise(resolve => setTimeout(resolve, 10))

    const updated = await updateTransaction(
      original.id,
      { description: 'Outro' },
      user.id,
    )

    expect(updated.updatedAt.getTime()).toBeGreaterThan(
      original.updatedAt.getTime(),
    )
  })
})
