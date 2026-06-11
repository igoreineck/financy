import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CategoryAggregate } from '../hooks/use-category-aggregates'
import { CategorySummary } from './category-summary'

function build(
  id: string,
  name: string,
  count: number,
  total: number,
): CategoryAggregate {
  return {
    category: { id, name, color: 'orange', icon: 'utensils' },
    count,
    total,
  }
}

describe('CategorySummary', () => {
  it('renders the empty state when there are no aggregates', () => {
    render(<CategorySummary aggregates={[]} />)
    expect(
      screen.getByText('Sem categorias movimentadas neste mês.'),
    ).toBeInTheDocument()
  })

  it('limits to the top 5 entries', () => {
    const aggregates = Array.from({ length: 7 }, (_, i) =>
      build(String(i), `Cat ${i}`, 1, 1_000 - i),
    )
    render(<CategorySummary aggregates={aggregates} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(5)
    expect(within(items[0]).getByText('Cat 0')).toBeInTheDocument()
    expect(within(items[4]).getByText('Cat 4')).toBeInTheDocument()
  })

  it('formats count and total per row', () => {
    render(
      <CategorySummary
        aggregates={[
          build('c1', 'Alimentação', 1, 12_345),
          build('c2', 'Transporte', 3, 9_900),
        ]}
      />,
    )
    expect(screen.getByText('1 item')).toBeInTheDocument()
    expect(screen.getByText('3 itens')).toBeInTheDocument()
    expect(screen.getByText('R$ 123,45')).toBeInTheDocument()
    expect(screen.getByText('R$ 99,00')).toBeInTheDocument()
  })
})
