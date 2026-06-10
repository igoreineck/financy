import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TypeBadge } from './type-badge'

describe('<TypeBadge />', () => {
  it('renders INCOME with success color and entrada label', () => {
    render(<TypeBadge type="INCOME" />)
    const badge = screen.getByText('Entrada').closest('span')
    expect(badge).toHaveAttribute('data-type', 'INCOME')
    expect(badge).toHaveClass('text-success')
  })

  it('renders EXPENSE with danger color and saída label', () => {
    render(<TypeBadge type="EXPENSE" />)
    const badge = screen.getByText('Saída').closest('span')
    expect(badge).toHaveAttribute('data-type', 'EXPENSE')
    expect(badge).toHaveClass('text-danger')
  })
})
