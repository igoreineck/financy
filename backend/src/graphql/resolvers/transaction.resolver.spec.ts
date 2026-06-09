import 'reflect-metadata'

import { ApolloServer } from '@apollo/server'
import { faker } from '@faker-js/faker'
import type { GraphQLSchema } from 'graphql'
import { buildSchema } from 'type-graphql'
import { beforeAll, describe, expect, it } from 'vitest'

import { registerUser } from '@/app/auth/register-user'
import { createCategory } from '@/app/categories/create-category'
import type { GraphqlContext } from '@/graphql/context'
import { AuthResolver } from './auth.resolver'
import { CategoryResolver } from './category.resolver'
import { TransactionResolver } from './transaction.resolver'

type SingleResult = {
  data?: Record<string, unknown> | null
  errors?: ReadonlyArray<{ message: string }>
}

let schema: GraphQLSchema
let server: ApolloServer<GraphqlContext>

beforeAll(async () => {
  schema = await buildSchema({
    resolvers: [AuthResolver, CategoryResolver, TransactionResolver],
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

const CREATE_TRANSACTION = /* GraphQL */ `
  mutation CreateTransaction($data: CreateTransactionInput!) {
    createTransaction(data: $data) {
      id
      description
      amount
      type
      occurredAt
      categoryId
    }
  }
`

describe('TransactionResolver', () => {
  it('createTransaction with token creates and returns the object', async () => {
    const user = await makeUser()
    const category = await makeCategory(user.id)
    const occurredAt = '2026-06-08T12:00:00.000Z'

    const result = await execute(
      CREATE_TRANSACTION,
      {
        data: {
          description: 'Almoço',
          amount: 1234,
          type: 'EXPENSE',
          occurredAt,
          categoryId: category.id,
        },
      },
      user.id,
    )

    expect(result.errors).toBeUndefined()
    const created = result.data?.createTransaction as {
      id: string
      description: string
      amount: number
      type: string
      occurredAt: string
      categoryId: string
    }
    expect(created.id).toEqual(expect.any(String))
    expect(created.description).toBe('Almoço')
    expect(created.amount).toBe(1234)
    expect(created.type).toBe('EXPENSE')
    expect(new Date(created.occurredAt).toISOString()).toBe(occurredAt)
    expect(created.categoryId).toBe(category.id)
  })

  it('createTransaction without token rejects with auth error', async () => {
    const result = await execute(CREATE_TRANSACTION, {
      data: {
        description: 'Sem token',
        amount: 100,
        type: 'EXPENSE',
        occurredAt: '2026-06-08T12:00:00.000Z',
        categoryId: 'whatever',
      },
    })

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Usuário não autenticado!')
  })

  it('createTransaction with categoryId of another user rejects with not-found', async () => {
    const owner = await makeUser()
    const attacker = await makeUser()
    const category = await makeCategory(owner.id)

    const result = await execute(
      CREATE_TRANSACTION,
      {
        data: {
          description: 'IDOR',
          amount: 100,
          type: 'EXPENSE',
          occurredAt: '2026-06-08T12:00:00.000Z',
          categoryId: category.id,
        },
      },
      attacker.id,
    )

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Categoria não encontrada')
  })

  it('createTransaction rejects invalid type values at the schema level', async () => {
    const user = await makeUser()
    const category = await makeCategory(user.id)

    const result = await execute(
      CREATE_TRANSACTION,
      {
        data: {
          description: 'Tipo inválido',
          amount: 100,
          type: 'TRANSFER',
          occurredAt: '2026-06-08T12:00:00.000Z',
          categoryId: category.id,
        },
      },
      user.id,
    )

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toMatch(/TransactionType/)
  })
})
