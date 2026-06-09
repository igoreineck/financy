import { faker } from '@faker-js/faker'
import { compare } from 'bcryptjs'
import { describe, expect, it } from 'vitest'

import { prisma } from '@/infra/db/prisma'
import { registerUser } from './register-user'

describe('registerUser', () => {
  it('creates user and returns token + user with hashed password', async () => {
    const password = faker.internet.password({ length: 12 })
    const input = {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password,
    }

    const { token, user } = await registerUser(input)

    expect(token).toEqual(expect.any(String))
    expect(user.id).toEqual(expect.any(String))
    expect(user.email).toBe(input.email)
    expect(user.name).toBe(input.name)

    const stored = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    })
    expect(stored.password).not.toBe(password)
    expect(await compare(password, stored.password)).toBe(true)
  })

  it('rejects when the email is already registered', async () => {
    const input = {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12 }),
    }
    await registerUser(input)

    await expect(
      registerUser({
        name: faker.person.fullName(),
        email: input.email,
        password: faker.internet.password({ length: 12 }),
      }),
    ).rejects.toThrow('E-mail já cadastrado!')
  })

  it('normalizes email casing and rejects duplicates regardless of case', async () => {
    const email = faker.internet.email().toLowerCase()
    await registerUser({
      name: faker.person.fullName(),
      email: `  ${email.toUpperCase()}  `,
      password: faker.internet.password({ length: 12 }),
    })

    await expect(
      registerUser({
        name: faker.person.fullName(),
        email,
        password: faker.internet.password({ length: 12 }),
      }),
    ).rejects.toThrow('E-mail já cadastrado!')
  })

  it('returns a user object without the password field', async () => {
    const { user } = await registerUser({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12 }),
    })

    expect(user).not.toHaveProperty('password')
  })
})
