import { faker } from '@faker-js/faker'
import { compare } from 'bcryptjs'
import { describe, expect, it } from 'vitest'

import { prisma } from '@/infra/db/prisma'
import { registerUser } from './register-user'

describe('registerUser', () => {
  it('cria usuário e retorna token + user com password hasheada', async () => {
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

  it('lança E-mail já cadastrado! quando o email já existe', async () => {
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
})
