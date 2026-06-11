import { Toaster } from '@/components/ui/sonner'
import { apolloClient } from '@/lib/apollo'
import { server } from '@/test/msw/server'
import { ApolloProvider } from '@apollo/client/react'
import { render, screen, within } from '@testing-library/react'
import { HttpResponse, graphql } from 'msw'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { DashboardPage } from './dashboard-page'

const categories = [
  {
    __typename: 'CategoryModel' as const,
    id: 'c1',
    name: 'Alimentação',
    description: null,
    color: 'orange',
    icon: 'utensils',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    __typename: 'CategoryModel' as const,
    id: 'c2',
    name: 'Transporte',
    description: null,
    color: 'blue',
    icon: 'car-front',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    __typename: 'CategoryModel' as const,
    id: 'c3',
    name: 'Lazer',
    description: null,
    color: 'purple',
    icon: 'ticket',
    createdAt: '2025-01-01T00:00:00Z',
  },
]

type Seed = {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  occurredAt: string
  categoryId: string
}

function category(id: string) {
  const c = categories.find(x => x.id === id)
  if (!c) throw new Error(`unknown category ${id}`)
  return c
}

function isoInCurrentMonth(day: number): string {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}-${String(day).padStart(2, '0')}T00:00:00Z`
}

function isoInPreviousMonth(day: number): string {
  const now = new Date()
  const ref = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
  const y = ref.getUTCFullYear()
  const m = String(ref.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}-${String(day).padStart(2, '0')}T00:00:00Z`
}

function setup(transactions: Seed[]) {
  server.use(
    graphql.query('ListTransactions', () =>
      HttpResponse.json({
        data: {
          listTransactions: transactions.map(t => ({
            __typename: 'TransactionModel',
            ...t,
            category: category(t.categoryId),
          })),
        },
      }),
    ),
    graphql.query('ListCategories', () =>
      HttpResponse.json({ data: { listCategories: categories } }),
    ),
  )
}

function renderPage() {
  return render(
    <ApolloProvider client={apolloClient}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
      <Toaster />
    </ApolloProvider>,
  )
}

afterEach(async () => {
  await apolloClient.clearStore()
})

describe('Dashboard — integração', () => {
  it('mostra stats do mês, top 5 recentes e top 5 categorias', async () => {
    const seeds: Seed[] = [
      {
        id: 't1',
        description: 'Salário',
        amount: 500_000,
        type: 'INCOME',
        occurredAt: isoInCurrentMonth(2),
        categoryId: 'c1',
      },
      {
        id: 't2',
        description: 'Mercado',
        amount: 20_000,
        type: 'EXPENSE',
        occurredAt: isoInCurrentMonth(5),
        categoryId: 'c1',
      },
      {
        id: 't3',
        description: 'Uber',
        amount: 5_000,
        type: 'EXPENSE',
        occurredAt: isoInCurrentMonth(7),
        categoryId: 'c2',
      },
      {
        id: 't4',
        description: 'Cinema',
        amount: 8_000,
        type: 'EXPENSE',
        occurredAt: isoInCurrentMonth(10),
        categoryId: 'c3',
      },
      {
        id: 't5',
        description: 'Aluguel',
        amount: 150_000,
        type: 'EXPENSE',
        occurredAt: isoInCurrentMonth(14),
        categoryId: 'c2',
      },
      // Previous month — must be ignored by stats and aggregates
      {
        id: 't-old',
        description: 'Conta antiga',
        amount: 90_000,
        type: 'EXPENSE',
        occurredAt: isoInPreviousMonth(1),
        categoryId: 'c1',
      },
    ]
    setup(seeds)
    renderPage()

    // Receitas — 5000,00; Despesas — 1830,00; Saldo — 3170,00. Outside-month
    // entries (t-old) are excluded.
    expect(await screen.findByText('R$ 5.000,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.830,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 3.170,00')).toBeInTheDocument()

    const recent = screen.getByRole('region', {
      name: 'Transações recentes',
    })
    const recentItems = within(recent).getAllByRole('listitem')
    expect(recentItems).toHaveLength(5)
    expect(within(recentItems[0]).getByText('Aluguel')).toBeInTheDocument()
    expect(within(recentItems[1]).getByText('Cinema')).toBeInTheDocument()
    expect(within(recentItems[4]).getByText('Salário')).toBeInTheDocument()

    const summary = screen.getByRole('region', {
      name: 'Categorias mais usadas',
    })
    const summaryItems = within(summary).getAllByRole('listitem')
    expect(summaryItems).toHaveLength(3)
    expect(within(summaryItems[0]).getByText('Alimentação')).toBeInTheDocument()
    expect(within(summaryItems[1]).getByText('Transporte')).toBeInTheDocument()
    expect(within(summaryItems[2]).getByText('Lazer')).toBeInTheDocument()
  })

  it('mostra o empty state quando não há nenhuma transação', async () => {
    setup([])
    renderPage()

    expect(
      await screen.findByText('Nenhuma transação ainda'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Nova transação/i }),
    ).toHaveAttribute('href', '/transacoes')
  })
})
