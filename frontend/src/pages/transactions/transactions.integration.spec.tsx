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

describe('Transações — fluxo completo', () => {
  it('lista, cria, edita e deleta com refresh da tabela', async () => {
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
      screen.getAllByRole('button', { name: /Nova transação/i })[0],
    )
    await user.type(screen.getByLabelText('Descrição'), 'Farmácia')
    await user.type(screen.getByLabelText('Valor'), '3000')
    await user.type(screen.getByLabelText('Data'), '2025-11-09')
    await user.click(screen.getByRole('combobox', { name: 'Categoria' }))
    await user.click(await screen.findByRole('option', { name: 'Alimentação' }))
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Farmácia')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Editar Farmácia' }))
    const desc = screen.getByLabelText('Descrição')
    await user.clear(desc)
    await user.type(desc, 'Farmácia Drogasil')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Farmácia Drogasil')).toBeInTheDocument()
    expect(
      screen.queryByText('Farmácia', { exact: true }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Excluir Mercado' }))
    const confirmDialog = await screen.findByRole('dialog')
    await user.click(
      within(confirmDialog).getByRole('button', { name: 'Excluir' }),
    )

    await screen.findByText('Transação excluída')
    expect(screen.queryByText('Mercado')).not.toBeInTheDocument()
  })
})
