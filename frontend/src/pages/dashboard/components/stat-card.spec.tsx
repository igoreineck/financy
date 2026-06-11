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

  it('applies the positive variant', () => {
    const { container } = render(
      <StatCard
        label="Saldo total"
        valueCents={5_000}
        icon={Wallet}
        variant="positive"
      />,
    )
    expect(container.firstChild).toHaveAttribute('data-variant', 'positive')
    expect(screen.getByText('R$ 50,00')).toHaveClass('text-success')
  })

  it('applies the negative variant', () => {
    const { container } = render(
      <StatCard
        label="Despesas do mês"
        valueCents={9_900}
        icon={Wallet}
        variant="negative"
      />,
    )
    expect(container.firstChild).toHaveAttribute('data-variant', 'negative')
    expect(screen.getByText('R$ 99,00')).toHaveClass('text-danger')
  })

  it('defaults to the neutral variant', () => {
    const { container } = render(
      <StatCard label="Saldo total" valueCents={0} icon={Wallet} />,
    )
    expect(container.firstChild).toHaveAttribute('data-variant', 'neutral')
  })
})
