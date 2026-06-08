import 'reflect-metadata'

import { ApolloServer } from '@apollo/server'
import { faker } from '@faker-js/faker'
import type { GraphQLSchema } from 'graphql'
import { buildSchema } from 'type-graphql'
import { beforeAll, describe, expect, it } from 'vitest'

import type { GraphqlContext } from '@/graphql/context'
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

function ctx(userId?: string): GraphqlContext {
  return {
    user: userId,
    token: undefined,
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
) {
  const response = await server.executeOperation(
    { query, variables },
    { contextValue: ctx(userId) },
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
    expect(result.errors?.[0]?.message).toBe('Usuário não cadastrado!')
  })

  it('me without a token rejects with auth error', async () => {
    const result = await execute(ME, {})

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Usuário não autenticado!')
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
})
