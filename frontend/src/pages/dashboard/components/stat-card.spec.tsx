import { render, screen } from '@testing-library/react'
import { Wallet } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { StatCard } from './stat-card'

describe('StatCard', () => {
  it('formats the value as pt-BR currency', () => {
    render(
      <StatCard label="Receitas do mês" valueCents={123_456} icon={Wallet} />,
    )
    expect(screen.getByText('R$ 1.234,56')).toBeInTheDocument()
    expect(screen.getByText('Receitas do mês')).toBeInTheDocument()
  })

  it('keeps the value text neutral regardless of variant', () => {
    render(
      <StatCard
        label="Saldo total"
        valueCents={5_000}
        icon={Wallet}
        variant="positive"
      />,
    )
    expect(screen.getByText('R$ 50,00')).toHaveClass('text-gray-800')
  })

  it('marks the variant on the root element', () => {
    const { container } = render(
      <StatCard
        label="Despesas do mês"
        valueCents={9_900}
        icon={Wallet}
        variant="negative"
      />,
    )
    expect(container.firstChild).toHaveAttribute('data-variant', 'negative')
  })

  it('defaults to the neutral variant', () => {
    const { container } = render(
      <StatCard label="Saldo total" valueCents={0} icon={Wallet} />,
    )
    expect(container.firstChild).toHaveAttribute('data-variant', 'neutral')
  })
})
