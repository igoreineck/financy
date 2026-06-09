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
    authError: undefined,
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

const LIST_TRANSACTIONS = /* GraphQL */ `
  query ListTransactions {
    listTransactions {
      id
      description
      amount
      type
      occurredAt
      category {
        id
        name
        color
        icon
      }
    }
  }
`

const UPDATE_TRANSACTION = /* GraphQL */ `
  mutation UpdateTransaction($id: ID!, $data: UpdateTransactionInput!) {
    updateTransaction(id: $id, data: $data) {
      id
      description
      amount
      type
      occurredAt
      categoryId
    }
  }
`

const DELETE_TRANSACTION = /* GraphQL */ `
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`

const GET_TRANSACTION = /* GraphQL */ `
  query GetTransaction($id: ID!) {
    transaction(id: $id) {
      id
      description
      amount
      type
      occurredAt
      category {
        id
        name
      }
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

  it('listTransactions returns the user transactions with resolved category', async () => {
    const user = await makeUser()
    const category = await makeCategory(user.id)

    await execute(
      CREATE_TRANSACTION,
      {
        data: {
          description: 'Almoço',
          amount: 1234,
          type: 'EXPENSE',
          occurredAt: '2026-06-01T12:00:00.000Z',
          categoryId: category.id,
        },
      },
      user.id,
    )
    await execute(
      CREATE_TRANSACTION,
      {
        data: {
          description: 'Salário',
          amount: 500000,
          type: 'INCOME',
          occurredAt: '2026-06-05T12:00:00.000Z',
          categoryId: category.id,
        },
      },
      user.id,
    )

    const result = await execute(LIST_TRANSACTIONS, {}, user.id)

    expect(result.errors).toBeUndefined()
    const list = result.data?.listTransactions as Array<{
      description: string
      category: { id: string; name: string; color: string; icon: string }
    }>
    expect(list.map(t => t.description)).toEqual(['Salário', 'Almoço'])
    expect(list[0]?.category).toMatchObject({
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
    })
  })

  it('listTransactions without token rejects with auth error', async () => {
    const result = await execute(LIST_TRANSACTIONS, {})

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Usuário não autenticado!')
  })

  it('updateTransaction returns the updated object', async () => {
    const user = await makeUser()
    const category = await makeCategory(user.id)

    const created = await execute(
      CREATE_TRANSACTION,
      {
        data: {
          description: 'Almoço',
          amount: 1234,
          type: 'EXPENSE',
          occurredAt: '2026-06-08T12:00:00.000Z',
          categoryId: category.id,
        },
      },
      user.id,
    )
    const id = (created.data?.createTransaction as { id: string }).id

    const result = await execute(
      UPDATE_TRANSACTION,
      { id, data: { description: 'Janta', amount: 2000 } },
      user.id,
    )

    expect(result.errors).toBeUndefined()
    const updated = result.data?.updateTransaction as {
      id: string
      description: string
      amount: number
      type: string
    }
    expect(updated.id).toBe(id)
    expect(updated.description).toBe('Janta')
    expect(updated.amount).toBe(2000)
    expect(updated.type).toBe('EXPENSE')
  })

  it('updateTransaction rejects editing another user transaction', async () => {
    const owner = await makeUser()
    const attacker = await makeUser()
    const category = await makeCategory(owner.id)

    const created = await execute(
      CREATE_TRANSACTION,
      {
        data: {
          description: 'Privada',
          amount: 1234,
          type: 'EXPENSE',
          occurredAt: '2026-06-08T12:00:00.000Z',
          categoryId: category.id,
        },
      },
      owner.id,
    )
    const id = (created.data?.createTransaction as { id: string }).id

    const result = await execute(
      UPDATE_TRANSACTION,
      { id, data: { description: 'Hackeada' } },
      attacker.id,
    )

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Transação não encontrada')
  })

  it('deleteTransaction returns true and the transaction disappears from listTransactions', async () => {
    const user = await makeUser()
    const category = await makeCategory(user.id)

    const created = await execute(
      CREATE_TRANSACTION,
      {
        data: {
          description: 'A excluir',
          amount: 1234,
          type: 'EXPENSE',
          occurredAt: '2026-06-08T12:00:00.000Z',
          categoryId: category.id,
        },
      },
      user.id,
    )
    const id = (created.data?.createTransaction as { id: string }).id

    const result = await execute(DELETE_TRANSACTION, { id }, user.id)

    expect(result.errors).toBeUndefined()
    expect(result.data?.deleteTransaction).toBe(true)

    const list = await execute(LIST_TRANSACTIONS, {}, user.id)
    const ids = (list.data?.listTransactions as Array<{ id: string }>).map(
      t => t.id,
    )
    expect(ids).not.toContain(id)
  })

  it('deleteTransaction rejects deleting another user transaction', async () => {
    const owner = await makeUser()
    const attacker = await makeUser()
    const category = await makeCategory(owner.id)

    const created = await execute(
      CREATE_TRANSACTION,
      {
        data: {
          description: 'Privada',
          amount: 1234,
          type: 'EXPENSE',
          occurredAt: '2026-06-08T12:00:00.000Z',
          categoryId: category.id,
        },
      },
      owner.id,
    )
    const id = (created.data?.createTransaction as { id: string }).id

    const result = await execute(DELETE_TRANSACTION, { id }, attacker.id)

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Transação não encontrada')
  })

  it('deleteTransaction without token rejects with auth error', async () => {
    const result = await execute(DELETE_TRANSACTION, {
      id: faker.string.uuid(),
    })

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Usuário não autenticado!')
  })

  it('transaction returns the transaction owned by the user with its category', async () => {
    const user = await makeUser()
    const category = await makeCategory(user.id)

    const created = await execute(
      CREATE_TRANSACTION,
      {
        data: {
          description: 'Almoço',
          amount: 1234,
          type: 'EXPENSE',
          occurredAt: '2026-06-08T12:00:00.000Z',
          categoryId: category.id,
        },
      },
      user.id,
    )
    const id = (created.data?.createTransaction as { id: string }).id

    const result = await execute(GET_TRANSACTION, { id }, user.id)

    expect(result.errors).toBeUndefined()
    const fetched = result.data?.transaction as {
      id: string
      description: string
      amount: number
      category: { id: string; name: string }
    }
    expect(fetched.id).toBe(id)
    expect(fetched.description).toBe('Almoço')
    expect(fetched.amount).toBe(1234)
    expect(fetched.category).toMatchObject({
      id: category.id,
      name: category.name,
    })
  })

  it('transaction rejects fetching another user transaction', async () => {
    const owner = await makeUser()
    const attacker = await makeUser()
    const category = await makeCategory(owner.id)

    const created = await execute(
      CREATE_TRANSACTION,
      {
        data: {
          description: 'Privada',
          amount: 1234,
          type: 'EXPENSE',
          occurredAt: '2026-06-08T12:00:00.000Z',
          categoryId: category.id,
        },
      },
      owner.id,
    )
    const id = (created.data?.createTransaction as { id: string }).id

    const result = await execute(GET_TRANSACTION, { id }, attacker.id)

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Transação não encontrada')
  })

  it('transaction including the category field rejects when the parent belongs to another user', async () => {
    const owner = await makeUser()
    const attacker = await makeUser()
    const category = await makeCategory(owner.id)

    const created = await execute(
      CREATE_TRANSACTION,
      {
        data: {
          description: 'Privada',
          amount: 1234,
          type: 'EXPENSE',
          occurredAt: '2026-06-08T12:00:00.000Z',
          categoryId: category.id,
        },
      },
      owner.id,
    )
    const id = (created.data?.createTransaction as { id: string }).id

    const result = await execute(GET_TRANSACTION, { id }, attacker.id)

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Transação não encontrada')
  })

  it('transaction without token rejects with auth error', async () => {
    const result = await execute(GET_TRANSACTION, { id: faker.string.uuid() })

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Usuário não autenticado!')
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
