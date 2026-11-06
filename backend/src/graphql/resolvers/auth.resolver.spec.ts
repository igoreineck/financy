import 'reflect-metadata'

import { ApolloServer } from '@apollo/server'
import { faker } from '@faker-js/faker'
import type { GraphQLSchema } from 'graphql'
import { buildSchema } from 'type-graphql'
import { beforeAll, describe, expect, it } from 'vitest'

import type { AuthErrorReason, GraphqlContext } from '@/graphql/context'
import { prisma } from '@/infra/db/prisma'
import { verifyJwt } from '@/shared/jwt'
import { AuthResolver } from './auth.resolver'

type SingleResult = {
  data?: Record<string, unknown> | null
  errors?: ReadonlyArray<{ message: string }>
}

let schema: GraphQLSchema
let server: ApolloServer<GraphqlContext>

beforeAll(async () => {
  schema = await buildSchema({
    resolvers: [AuthResolver],
    validate: false,
  })
  server = new ApolloServer<GraphqlContext>({ schema })
})

function ctx(userId?: string, authError?: AuthErrorReason): GraphqlContext {
  return {
    user: userId,
    token: undefined,
    authError,
    // biome-ignore lint/suspicious/noExplicitAny: integration test stub for req/res
    req: {} as any,
    // biome-ignore lint/suspicious/noExplicitAny: integration test stub for req/res
    res: {} as any,
  }
}

async function execute(
  query: string,
  variables: Record<string, unknown>,
  userId?: string,
  authError?: AuthErrorReason,
) {
  const response = await server.executeOperation(
    { query, variables },
    { contextValue: ctx(userId, authError) },
  )
  if (response.body.kind !== 'single') {
    throw new Error('Expected single result')
  }
  return response.body.singleResult as SingleResult
}

const REGISTER = /* GraphQL */ `
  mutation Register($data: RegisterInput!) {
    register(data: $data) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

const LOGIN = /* GraphQL */ `
  mutation Login($data: LoginInput!) {
    login(data: $data) {
      token
      user {
        id
        email
      }
    }
  }
`

const ME = /* GraphQL */ `
  query Me {
    me {
      id
      email
    }
  }
`

const UPDATE_PROFILE = /* GraphQL */ `
  mutation UpdateProfile($data: UpdateProfileInput!) {
    updateProfile(data: $data) {
      id
      name
      email
    }
  }
`

describe('AuthResolver', () => {
  it('register returns token + user via GraphQL', async () => {
    const data = {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12 }),
    }

    const result = await execute(REGISTER, { data })

    expect(result.errors).toBeUndefined()
    const register = (result.data?.register ?? {}) as {
      token: string
      user: { id: string; name: string; email: string }
    }
    expect(register.token).toEqual(expect.any(String))
    expect(register.user.email).toBe(data.email)
    expect(register.user.name).toBe(data.name)
    expect(register.user.id).toEqual(expect.any(String))
    expect(verifyJwt(register.token).id).toBe(register.user.id)
  })

  it('login returns token + user via GraphQL', async () => {
    const data = {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12 }),
    }
    await execute(REGISTER, { data })

    const result = await execute(LOGIN, {
      data: { email: data.email, password: data.password },
    })

    expect(result.errors).toBeUndefined()
    const login = (result.data?.login ?? {}) as {
      token: string
      user: { id: string; email: string }
    }
    expect(login.token).toEqual(expect.any(String))
    expect(login.user.email).toBe(data.email)
  })

  it('propagates domain errors via GraphQL errors[]', async () => {
    const result = await execute(LOGIN, {
      data: {
        email: faker.internet.email().toLowerCase(),
        password: 'whatever',
      },
    })

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Invalid credentials!')
  })

  it('register response does not include the password field', async () => {
    const data = {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12 }),
    }
    const SELECT_PASSWORD = /* GraphQL */ `
      mutation Register($data: RegisterInput!) {
        register(data: $data) {
          user { password }
        }
      }
    `

    const result = await execute(SELECT_PASSWORD, { data })

    expect(result.data).toBeUndefined()
    expect(result.errors?.[0]?.message).toMatch(/Cannot query field "password"/)
  })

  it('me without a token rejects with auth error', async () => {
    const result = await execute(ME, {})

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('User not authenticated!')
  })

  it('me with an expired token surfaces "Session expired!"', async () => {
    const result = await execute(ME, {}, undefined, 'expired')

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Session expired!')
  })

  it('me with an invalid token surfaces "Invalid token!"', async () => {
    const result = await execute(ME, {}, undefined, 'invalid')

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Invalid token!')
  })

  it('me with a token for a deleted user rejects with auth error', async () => {
    const data = {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12 }),
    }
    const registered = await execute(REGISTER, { data })
    const register = registered.data?.register as {
      token: string
      user: { id: string }
    }

    await prisma.user.delete({ where: { id: register.user.id } })

    const result = await execute(ME, {}, register.user.id)

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('User not authenticated!')
  })

  it('me with a valid token returns the user', async () => {
    const data = {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12 }),
    }
    const registered = await execute(REGISTER, { data })
    const register = registered.data?.register as {
      token: string
      user: { id: string }
    }

    const result = await execute(ME, {}, register.user.id)

    expect(result.errors).toBeUndefined()
    const me = result.data?.me as { id: string; email: string }
    expect(me.id).toBe(register.user.id)
    expect(me.email).toBe(data.email)
  })

  it('updateProfile changes the name for the authenticated user', async () => {
    const data = {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12 }),
    }
    const registered = await execute(REGISTER, { data })
    const register = registered.data?.register as {
      token: string
      user: { id: string }
    }

    const result = await execute(
      UPDATE_PROFILE,
      { data: { name: 'Outro Nome' } },
      register.user.id,
    )

    expect(result.errors).toBeUndefined()
    const updated = result.data?.updateProfile as {
      id: string
      name: string
      email: string
    }
    expect(updated.id).toBe(register.user.id)
    expect(updated.name).toBe('Outro Nome')
    expect(updated.email).toBe(data.email)
  })

  it('updateProfile rejects unauthenticated requests', async () => {
    const result = await execute(UPDATE_PROFILE, {
      data: { name: 'Qualquer Nome' },
    })

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('User not authenticated!')
  })

  it('updateProfile rejects when the new name is blank', async () => {
    const data = {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12 }),
    }
    const registered = await execute(REGISTER, { data })
    const register = registered.data?.register as {
      token: string
      user: { id: string }
    }

    const result = await execute(
      UPDATE_PROFILE,
      { data: { name: '   ' } },
      register.user.id,
    )

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Name is required!')
  })
})
