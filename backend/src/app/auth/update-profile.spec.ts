import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'

import { prisma } from '@/infra/db/prisma'
import { registerUser } from './register-user'
import { updateProfile } from './update-profile'

async function seedUser() {
  return registerUser({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
  })
}

describe('updateProfile', () => {
  it('updates the name and returns the user without the password', async () => {
    const { user } = await seedUser()

    const updated = await updateProfile({
      userId: user.id,
      name: 'Novo Nome',
    })

    expect(updated.id).toBe(user.id)
    expect(updated.name).toBe('Novo Nome')
    expect(updated.email).toBe(user.email)
    expect(updated).not.toHaveProperty('password')
  })

  it('trims whitespace around the new name', async () => {
    const { user } = await seedUser()

    const updated = await updateProfile({
      userId: user.id,
      name: '  Igor Eineck  ',
    })

    expect(updated.name).toBe('Igor Eineck')
  })

  it('rejects when the new name is blank', async () => {
    const { user } = await seedUser()

    await expect(
      updateProfile({ userId: user.id, name: '   ' }),
    ).rejects.toThrow('Nome obrigatório!')
  })

  it('does not modify the email when only the name changes', async () => {
    const { user } = await seedUser()

    await updateProfile({ userId: user.id, name: 'Outro Nome' })

    const stored = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    })
    expect(stored.email).toBe(user.email)
  })
})
