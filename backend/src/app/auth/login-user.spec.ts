import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'

import { loginUser } from './login-user'
import { registerUser } from './register-user'

async function seedUser() {
  const password = faker.internet.password({ length: 12 })
  const { user } = await registerUser({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password,
  })
  return { user, password }
}

describe('loginUser', () => {
  it('returns token and user with valid credentials', async () => {
    const { user, password } = await seedUser()

    const result = await loginUser({ email: user.email, password })

    expect(result.token).toEqual(expect.any(String))
    expect(result.user.id).toBe(user.id)
    expect(result.user.email).toBe(user.email)
  })

  it('rejects when the email is not registered', async () => {
    await expect(
      loginUser({
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password({ length: 12 }),
      }),
    ).rejects.toThrow('Invalid credentials!')
  })

  it('rejects when the password is wrong', async () => {
    const { user } = await seedUser()

    await expect(
      loginUser({ email: user.email, password: 'wrong-password' }),
    ).rejects.toThrow('Invalid credentials!')
  })

  it('matches the user when email casing differs from registration', async () => {
    const { user, password } = await seedUser()

    const result = await loginUser({
      email: user.email.toUpperCase(),
      password,
    })

    expect(result.user.id).toBe(user.id)
  })

  it('returns a user object without the password field', async () => {
    const { user, password } = await seedUser()

    const result = await loginUser({ email: user.email, password })

    expect(result.user).not.toHaveProperty('password')
  })
})
