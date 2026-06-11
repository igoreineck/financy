import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  type RecentTransaction,
  RecentTransactions,
} from './recent-transactions'

function build(
  overrides: Partial<RecentTransaction> & { id: string },
): RecentTransaction {
  return {
    description: overrides.description ?? 'Item',
    amount: overrides.amount ?? 1_000,
    type: overrides.type ?? 'EXPENSE',
    occurredAt: overrides.occurredAt ?? '2025-11-01T00:00:00Z',
    category: overrides.category ?? {
      id: 'c1',
      name: 'Alimentação',
      color: 'orange',
      icon: 'utensils',
    },
    id: overrides.id,
  }
}

describe('RecentTransactions', () => {
  it('shows an empty message when there are no transactions', () => {
    render(<RecentTransactions transactions={[]} />)
    expect(screen.getByText('Nenhuma transação por aqui.')).toBeInTheDocument()
  })

  it('limits to 5 items by default', () => {
    const txs = Array.from({ length: 8 }, (_, i) =>
      build({
        id: String(i),
        description: `Item ${i}`,
        occurredAt: `2025-11-0${(i % 9) + 1}T00:00:00Z`,
      }),
    )
    render(<RecentTransactions transactions={txs} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
  })

  it('orders by occurredAt descending', () => {
    render(
      <RecentTransactions
        transactions={[
          build({
            id: 'a',
            description: 'Oldest',
            occurredAt: '2025-11-01T00:00:00Z',
          }),
          build({
            id: 'b',
            description: 'Newest',
            occurredAt: '2025-11-30T00:00:00Z',
          }),
          build({
            id: 'c',
            description: 'Middle',
            occurredAt: '2025-11-15T00:00:00Z',
          }),
        ]}
      />,
    )
    const items = screen.getAllByRole('listitem')
    expect(within(items[0]).getByText('Newest')).toBeInTheDocument()
    expect(within(items[1]).getByText('Middle')).toBeInTheDocument()
    expect(within(items[2]).getByText('Oldest')).toBeInTheDocument()
  })

  it('renders amount with sign matching the type', () => {
    render(
      <RecentTransactions
        transactions={[
          build({ id: 'a', type: 'INCOME', amount: 12_345 }),
          build({ id: 'b', type: 'EXPENSE', amount: 6_700 }),
        ]}
      />,
    )
    expect(screen.getByText('+ R$ 123,45')).toHaveClass('text-success')
    expect(screen.getByText('- R$ 67,00')).toHaveClass('text-danger')
  })
})
