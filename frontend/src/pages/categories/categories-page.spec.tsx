import { Toaster } from '@/components/ui/sonner'
import { apolloClient } from '@/lib/apollo'
import { server } from '@/test/msw/server'
import { ApolloProvider } from '@apollo/client/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, graphql } from 'msw'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { CategoriesPage } from './categories-page'

type CategorySeed = {
  id: string
  name: string
  description?: string | null
  icon: string
  color: string
}

const sampleCategories: CategorySeed[] = [
  {
    id: 'c1',
    name: 'Alimentação',
    description: 'Comida',
    icon: 'utensils',
    color: 'orange',
  },
  {
    id: 'c2',
    name: 'Transporte',
    description: null,
    icon: 'car-front',
    color: 'blue',
  },
  {
    id: 'c3',
    name: 'Lazer',
    description: null,
    icon: 'ticket',
    color: 'purple',
  },
]

const sampleTransactions = [
  { id: 't1', categoryId: 'c1' },
  { id: 't2', categoryId: 'c1' },
  { id: 't3', categoryId: 'c2' },
]

function seed({
  categories = sampleCategories,
  transactions = sampleTransactions,
}: {
  categories?: CategorySeed[]
  transactions?: { id: string; categoryId: string }[]
} = {}) {
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
      HttpResponse.json({
        data: {
          listTransactions: transactions.map(t => ({
            __typename: 'TransactionModel',
            ...t,
          })),
        },
      }),
    ),
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

describe('<CategoriesPage />', () => {
  it('renders the grid with the categories returned by the API', async () => {
    seed()
    renderPage()
    expect(
      await screen.findByRole('heading', { name: 'Alimentação' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Transporte' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Lazer' })).toBeInTheDocument()
  })

  it('shows the empty state when there are no categories', async () => {
    seed({ categories: [], transactions: [] })
    renderPage()
    expect(
      await screen.findByText('Nenhuma categoria ainda'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Comece criando sua primeira categoria'),
    ).toBeInTheDocument()
  })

  it('opens the create dialog when clicking "Nova categoria"', async () => {
    seed()
    const user = userEvent.setup()
    renderPage()

    await screen.findByRole('heading', { name: 'Alimentação' })
    await user.click(screen.getByRole('button', { name: /Nova categoria/i }))

    expect(
      await screen.findByRole('heading', { name: 'Nova categoria' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveValue('')
  })

  it('shows the correct stat counts', async () => {
    seed()
    renderPage()

    await screen.findByRole('heading', { name: 'Alimentação' })

    const stats = screen.getByRole('region', {
      name: 'Resumo de categorias',
    })
    expect(stats).toHaveTextContent('Total de categorias')
    expect(stats).toHaveTextContent('3')
    expect(stats).toHaveTextContent('Total de transações')
    expect(stats).toHaveTextContent('Categoria mais usada')
    expect(stats).toHaveTextContent('Alimentação')
  })
})
