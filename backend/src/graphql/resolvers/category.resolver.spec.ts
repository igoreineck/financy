import 'reflect-metadata'

import { ApolloServer } from '@apollo/server'
import { faker } from '@faker-js/faker'
import type { GraphQLSchema } from 'graphql'
import { buildSchema } from 'type-graphql'
import { beforeAll, describe, expect, it } from 'vitest'

import { registerUser } from '@/app/auth/register-user'
import type { GraphqlContext } from '@/graphql/context'
import { AuthResolver } from './auth.resolver'
import { CategoryResolver } from './category.resolver'

type SingleResult = {
  data?: Record<string, unknown> | null
  errors?: ReadonlyArray<{ message: string }>
}

let schema: GraphQLSchema
let server: ApolloServer<GraphqlContext>

beforeAll(async () => {
  schema = await buildSchema({
    resolvers: [AuthResolver, CategoryResolver],
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

const CREATE_CATEGORY = /* GraphQL */ `
  mutation CreateCategory($data: CreateCategoryInput!) {
    createCategory(data: $data) {
      id
      name
      color
      icon
      description
    }
  }
`

const LIST_CATEGORIES = /* GraphQL */ `
  query ListCategories {
    listCategories {
      id
      name
      color
      icon
      description
    }
  }
`

const UPDATE_CATEGORY = /* GraphQL */ `
  mutation UpdateCategory($id: ID!, $data: UpdateCategoryInput!) {
    updateCategory(id: $id, data: $data) {
      id
      name
      color
      icon
      description
    }
  }
`

const DELETE_CATEGORY = /* GraphQL */ `
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`

const GET_CATEGORY = /* GraphQL */ `
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      color
      icon
      description
    }
  }
`

describe('CategoryResolver', () => {
  it('createCategory with token creates a category', async () => {
    const user = await makeUser()

    const result = await execute(
      CREATE_CATEGORY,
      {
        data: {
          name: 'Lazer',
          color: '#22BB55',
          icon: 'gamepad',
          description: 'Jogos e cinema',
        },
      },
      user.id,
    )

    expect(result.errors).toBeUndefined()
    const created = result.data?.createCategory as {
      id: string
      name: string
      color: string
      icon: string
      description: string | null
    }
    expect(created.id).toEqual(expect.any(String))
    expect(created.name).toBe('Lazer')
    expect(created.color).toBe('#22BB55')
    expect(created.icon).toBe('gamepad')
    expect(created.description).toBe('Jogos e cinema')
  })

  it('createCategory without description returns null', async () => {
    const user = await makeUser()

    const result = await execute(
      CREATE_CATEGORY,
      {
        data: {
          name: 'Saúde',
          color: '#FF0066',
          icon: 'heart',
        },
      },
      user.id,
    )

    expect(result.errors).toBeUndefined()
    const created = result.data?.createCategory as {
      description: string | null
    }
    expect(created.description).toBeNull()
  })

  it('createCategory without token rejects with auth error', async () => {
    const result = await execute(CREATE_CATEGORY, {
      data: {
        name: 'Bloqueado',
        color: '#000000',
        icon: 'lock',
      },
    })

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Usuário não autenticado!')
  })

  it('listCategories returns the authenticated user list ordered by name asc', async () => {
    const userA = await makeUser()
    const userB = await makeUser()

    await execute(
      CREATE_CATEGORY,
      { data: { name: 'Casa', color: '#111', icon: 'home' } },
      userA.id,
    )
    await execute(
      CREATE_CATEGORY,
      { data: { name: 'Alimentação', color: '#222', icon: 'utensils' } },
      userA.id,
    )
    await execute(
      CREATE_CATEGORY,
      { data: { name: 'Outra pessoa', color: '#333', icon: 'user' } },
      userB.id,
    )

    const result = await execute(LIST_CATEGORIES, {}, userA.id)

    expect(result.errors).toBeUndefined()
    const list = result.data?.listCategories as Array<{ name: string }>
    expect(list.map(c => c.name)).toEqual(['Alimentação', 'Casa'])
  })

  it('listCategories without token rejects with auth error', async () => {
    const result = await execute(LIST_CATEGORIES, {})

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Usuário não autenticado!')
  })

  it('updateCategory updates the provided fields', async () => {
    const user = await makeUser()

    const created = await execute(
      CREATE_CATEGORY,
      {
        data: {
          name: 'Comida',
          color: '#FF5733',
          icon: 'utensils',
          description: 'Mercado',
        },
      },
      user.id,
    )
    const id = (created.data?.createCategory as { id: string }).id

    const result = await execute(
      UPDATE_CATEGORY,
      { id, data: { name: 'Alimentação', color: '#AA0000' } },
      user.id,
    )

    expect(result.errors).toBeUndefined()
    expect(result.data?.updateCategory).toMatchObject({
      id,
      name: 'Alimentação',
      color: '#AA0000',
      icon: 'utensils',
      description: 'Mercado',
    })
  })

  it('updateCategory on another user category rejects with not-found', async () => {
    const userA = await makeUser()
    const userB = await makeUser()

    const created = await execute(
      CREATE_CATEGORY,
      { data: { name: 'Privada', color: '#000', icon: 'lock' } },
      userA.id,
    )
    const id = (created.data?.createCategory as { id: string }).id

    const result = await execute(
      UPDATE_CATEGORY,
      { id, data: { name: 'Hackeada' } },
      userB.id,
    )

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Categoria não encontrada')
  })

  it('updateCategory without token rejects with auth error', async () => {
    const result = await execute(UPDATE_CATEGORY, {
      id: 'whatever',
      data: { name: 'X' },
    })

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Usuário não autenticado!')
  })

  it('deleteCategory returns true on success', async () => {
    const user = await makeUser()

    const created = await execute(
      CREATE_CATEGORY,
      { data: { name: 'Temporária', color: '#999', icon: 'trash' } },
      user.id,
    )
    const id = (created.data?.createCategory as { id: string }).id

    const result = await execute(DELETE_CATEGORY, { id }, user.id)

    expect(result.errors).toBeUndefined()
    expect(result.data?.deleteCategory).toBe(true)

    const list = await execute(LIST_CATEGORIES, {}, user.id)
    expect((list.data?.listCategories as unknown[]).length).toBe(0)
  })

  it('deleteCategory on another user category rejects with not-found', async () => {
    const userA = await makeUser()
    const userB = await makeUser()

    const created = await execute(
      CREATE_CATEGORY,
      { data: { name: 'Privada', color: '#000', icon: 'lock' } },
      userA.id,
    )
    const id = (created.data?.createCategory as { id: string }).id

    const result = await execute(DELETE_CATEGORY, { id }, userB.id)

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Categoria não encontrada')
  })

  it('deleteCategory without token rejects with auth error', async () => {
    const result = await execute(DELETE_CATEGORY, { id: 'whatever' })

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Usuário não autenticado!')
  })

  it('category returns the category owned by the user', async () => {
    const user = await makeUser()
    const created = await execute(
      CREATE_CATEGORY,
      { data: { name: 'Lazer', color: '#22BB55', icon: 'gamepad' } },
      user.id,
    )
    const id = (created.data?.createCategory as { id: string }).id

    const result = await execute(GET_CATEGORY, { id }, user.id)

    expect(result.errors).toBeUndefined()
    const fetched = result.data?.category as { id: string; name: string }
    expect(fetched.id).toBe(id)
    expect(fetched.name).toBe('Lazer')
  })

  it('category rejects fetching another user category', async () => {
    const owner = await makeUser()
    const attacker = await makeUser()

    const created = await execute(
      CREATE_CATEGORY,
      { data: { name: 'Privada', color: '#000', icon: 'lock' } },
      owner.id,
    )
    const id = (created.data?.createCategory as { id: string }).id

    const result = await execute(GET_CATEGORY, { id }, attacker.id)

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Categoria não encontrada')
  })

  it('category without token rejects with auth error', async () => {
    const result = await execute(GET_CATEGORY, { id: faker.string.uuid() })

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('Usuário não autenticado!')
  })
})
