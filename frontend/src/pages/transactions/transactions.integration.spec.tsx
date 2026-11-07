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

type Seed = {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  occurredAt: string
  categoryId: string
}

const baseCategory = {
  __typename: 'CategoryModel' as const,
  id: 'c1',
  name: 'Alimentação',
  color: 'orange',
  icon: 'utensils',
}

function makeMutableServer(initial: Seed[]) {
  let transactions = [...initial]

  server.use(
    graphql.query('ListTransactions', () =>
      HttpResponse.json({
        data: {
          listTransactions: transactions.map(t => ({
            __typename: 'TransactionModel',
            ...t,
            category: baseCategory,
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
    graphql.mutation('CreateTransaction', async ({ variables }) => {
      const data = variables.data as Omit<Seed, 'id'>
      const created: Seed = { id: `new-${transactions.length + 1}`, ...data }
      transactions = [...transactions, created]
      return HttpResponse.json({
        data: {
          createTransaction: {
            __typename: 'TransactionModel',
            ...created,
            category: baseCategory,
          },
        },
      })
    }),
    graphql.mutation('UpdateTransaction', async ({ variables }) => {
      const id = variables.id as string
      const patch = variables.data as Partial<Seed>
      transactions = transactions.map(t =>
        t.id === id ? { ...t, ...patch } : t,
      )
      const updated = transactions.find(t => t.id === id)
      return HttpResponse.json({
        data: {
          updateTransaction: {
            __typename: 'TransactionModel',
            ...updated,
            category: baseCategory,
          },
        },
      })
    }),
    graphql.mutation('DeleteTransaction', async ({ variables }) => {
      const id = variables.id as string
      transactions = transactions.filter(t => t.id !== id)
      return HttpResponse.json({ data: { deleteTransaction: true } })
    }),
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

describe('Transactions — full flow', () => {
  it('lists, creates, edits, and deletes with table refresh', async () => {
    makeMutableServer([
      {
        id: 't1',
        description: 'Mercado',
        amount: 2500,
        type: 'EXPENSE',
        occurredAt: '2025-11-02T00:00:00Z',
        categoryId: 'c1',
      },
    ])

    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('Mercado')).toBeInTheDocument()

    await user.click(
      screen.getAllByRole('button', { name: /New transaction/i })[0],
    )
    await user.type(screen.getByLabelText('Description'), 'Farmácia')
    await user.type(screen.getByLabelText('Amount'), '3000')
    await user.type(screen.getByLabelText('Date'), '2025-11-09')
    await user.click(screen.getByRole('combobox', { name: 'Category' }))
    await user.click(await screen.findByRole('option', { name: 'Alimentação' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Farmácia')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit Farmácia' }))
    const desc = screen.getByLabelText('Description')
    await user.clear(desc)
    await user.type(desc, 'Farmácia Drogasil')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Farmácia Drogasil')).toBeInTheDocument()
    expect(
      screen.queryByText('Farmácia', { exact: true }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete Mercado' }))
    const confirmDialog = await screen.findByRole('dialog')
    await user.click(
      within(confirmDialog).getByRole('button', { name: 'Delete' }),
    )

    await screen.findByText('Transaction deleted')
    expect(screen.queryByText('Mercado')).not.toBeInTheDocument()
  })
})
