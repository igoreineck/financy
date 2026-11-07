import { Toaster } from '@/components/ui/sonner'
import { apolloClient } from '@/lib/apollo'
import { server } from '@/test/msw/server'
import { ApolloProvider } from '@apollo/client/react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, graphql } from 'msw'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { TransactionsPage } from './transactions-page'

beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn(() => false) as never
  Element.prototype.releasePointerCapture = vi.fn() as never
  Element.prototype.scrollIntoView = vi.fn() as never
})

type TransactionSeed = {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  occurredAt: string
  categoryId: string
  category: { id: string; name: string; color: string; icon: string }
}

function makeTransactions(count: number): TransactionSeed[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `t${i + 1}`,
    description: `Lançamento ${i + 1}`,
    amount: 1000 + i,
    type: i % 2 === 0 ? 'EXPENSE' : 'INCOME',
    occurredAt: '2025-11-10T00:00:00Z',
    categoryId: 'c1',
    category: {
      id: 'c1',
      name: 'Alimentação',
      color: 'orange',
      icon: 'utensils',
    },
  }))
}

function seed(transactions: TransactionSeed[]) {
  server.use(
    graphql.query('ListTransactions', () =>
      HttpResponse.json({
        data: {
          listTransactions: transactions.map(t => ({
            __typename: 'TransactionModel',
            ...t,
            category: { __typename: 'CategoryModel', ...t.category },
          })),
        },
      }),
    ),
    graphql.query('ListCategories', () =>
      HttpResponse.json({
        data: {
          listCategories: [
            {
              __typename: 'CategoryModel',
              id: 'c1',
              name: 'Alimentação',
              description: null,
              icon: 'utensils',
              color: 'orange',
              createdAt: '2025-01-01T00:00:00Z',
            },
          ],
        },
      }),
    ),
  )
}

function renderPage() {
  return render(
    <ApolloProvider client={apolloClient}>
      <MemoryRouter>
        <TransactionsPage />
      </MemoryRouter>
      <Toaster />
    </ApolloProvider>,
  )
}

afterEach(async () => {
  await apolloClient.clearStore()
})

describe('<TransactionsPage />', () => {
  it('renders 10 rows and shows "1 to 10 | 27 results"', async () => {
    seed(makeTransactions(27))
    renderPage()

    expect(await screen.findByText('Lançamento 1')).toBeInTheDocument()

    const rows = screen.getAllByRole('row')
    // 1 header row + 10 data rows
    expect(rows).toHaveLength(11)

    expect(screen.getByText('1 to 10 | 27 results')).toBeInTheDocument()
  })

  it('navigates to the next page and shows the remaining rows', async () => {
    seed(makeTransactions(27))
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Lançamento 1')

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(await screen.findByText('Lançamento 11')).toBeInTheDocument()
    expect(screen.getByText('11 to 20 | 27 results')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(await screen.findByText('Lançamento 21')).toBeInTheDocument()
    expect(screen.getByText('21 to 27 | 27 results')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(8)
  })

  it('shows the filter empty state when the filter returns zero results', async () => {
    seed(makeTransactions(5))
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Lançamento 1')

    await user.type(screen.getByLabelText('Search'), 'descrição inexistente')

    expect(await screen.findByText('No results')).toBeInTheDocument()
    expect(
      screen.getByText('Adjust the filters to see other transactions'),
    ).toBeInTheDocument()
  })

  it('opens the create dialog when clicking "New transaction"', async () => {
    seed(makeTransactions(2))
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Lançamento 1')
    await user.click(
      screen.getAllByRole('button', { name: /New transaction/i })[0],
    )

    expect(
      await screen.findByRole('heading', { name: 'New transaction' }),
    ).toBeInTheDocument()
  })

  it('shows the empty state when there are zero transactions', async () => {
    seed([])
    renderPage()

    expect(await screen.findByText('No transactions yet')).toBeInTheDocument()
  })

  it('opens the delete confirm with the row description', async () => {
    seed(makeTransactions(1))
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Lançamento 1')
    await user.click(
      screen.getByRole('button', { name: 'Delete Lançamento 1' }),
    )

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('heading', { name: 'Delete transaction?' }),
    ).toBeInTheDocument()
    expect(dialog).toHaveTextContent('"Lançamento 1" will be removed.')
  })
})
