import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TypeBadge } from './type-badge'

describe('<TypeBadge />', () => {
  it('renders INCOME with success color and entrada label', () => {
    render(<TypeBadge type="INCOME" />)
    const badge = screen.getByText('Income').closest('span')
    expect(badge).toHaveAttribute('data-type', 'INCOME')
    expect(badge).toHaveClass('text-success')
  })

  it('renders EXPENSE with danger color and Expense label', () => {
    render(<TypeBadge type="EXPENSE" />)
    const badge = screen.getByText('Expense').closest('span')
    expect(badge).toHaveAttribute('data-type', 'EXPENSE')
    expect(badge).toHaveClass('text-danger')
  })
})
