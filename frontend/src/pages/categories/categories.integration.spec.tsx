import { Toaster } from '@/components/ui/sonner'
import { apolloClient } from '@/lib/apollo'
import { server } from '@/test/msw/server'
import { ApolloProvider } from '@apollo/client/react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, graphql } from 'msw'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { CategoriesPage } from './categories-page'

type CategorySeed = {
  id: string
  name: string
  description: string | null
  icon: string
  color: string
}

function makeMutableServer(initial: CategorySeed[]) {
  let categories = [...initial]

  server.use(
    graphql.query('ListCategories', () =>
      HttpResponse.json({
        data: {
          listCategories: categories.map(c => ({
            __typename: 'CategoryModel',
            createdAt: new Date().toISOString(),
            ...c,
          })),
        },
      }),
    ),
    graphql.query('ListTransactionsForStats', () =>
      HttpResponse.json({ data: { listTransactions: [] } }),
    ),
    graphql.mutation('CreateCategory', async ({ variables }) => {
      const data = variables.data as {
        name: string
        description: string | null
        icon: string
        color: string
      }
      const created: CategorySeed = {
        id: `new-${categories.length + 1}`,
        ...data,
      }
      categories = [...categories, created]
      return HttpResponse.json({
        data: {
          createCategory: {
            __typename: 'CategoryModel',
            createdAt: new Date().toISOString(),
            ...created,
          },
        },
      })
    }),
    graphql.mutation('UpdateCategory', async ({ variables }) => {
      const id = variables.id as string
      const patch = variables.data as Partial<CategorySeed>
      categories = categories.map(c => (c.id === id ? { ...c, ...patch } : c))
      const updated = categories.find(c => c.id === id)
      return HttpResponse.json({
        data: {
          updateCategory: {
            __typename: 'CategoryModel',
            ...updated,
          },
        },
      })
    }),
    graphql.mutation('DeleteCategory', async ({ variables }) => {
      const id = variables.id as string
      categories = categories.filter(c => c.id !== id)
      return HttpResponse.json({ data: { deleteCategory: true } })
    }),
  )
}

function renderPage() {
  return render(
    <ApolloProvider client={apolloClient}>
      <MemoryRouter>
        <CategoriesPage />
      </MemoryRouter>
      <Toaster />
    </ApolloProvider>,
  )
}

afterEach(async () => {
  await apolloClient.clearStore()
})

describe('Categorias — fluxo completo', () => {
  it('lista, cria, edita e deleta categorias com refresh do grid', async () => {
    makeMutableServer([
      {
        id: 'c1',
        name: 'Alimentação',
        description: 'Comida',
        icon: 'utensils',
        color: 'orange',
      },
    ])

    const user = userEvent.setup()
    renderPage()

    expect(
      await screen.findByRole('heading', { name: 'Alimentação' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Nova categoria/i }))
    await user.type(screen.getByLabelText('Nome'), 'Transporte')
    await user.click(screen.getByRole('button', { name: 'car-front' }))
    await user.click(screen.getByRole('button', { name: 'blue' }))
    await user.click(screen.getByRole('button', { name: 'Criar categoria' }))

    expect(
      await screen.findByRole('heading', { name: 'Transporte' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Editar Transporte' }))
    const nameInput = screen.getByLabelText('Nome')
    await user.clear(nameInput)
    await user.type(nameInput, 'Mobilidade')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(
      await screen.findByRole('heading', { name: 'Mobilidade' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Transporte' }),
    ).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Excluir Alimentação' }),
    )
    const confirmDialog = await screen.findByRole('dialog')
    await user.click(
      within(confirmDialog).getByRole('button', { name: 'Excluir' }),
    )

    await screen.findByText('Categoria excluída')
    expect(
      screen.queryByRole('heading', { name: 'Alimentação' }),
    ).not.toBeInTheDocument()
  })
})
