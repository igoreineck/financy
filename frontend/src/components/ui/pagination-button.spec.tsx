import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PaginationButton } from './pagination-button'

describe('<PaginationButton />', () => {
  it('marks aria-current when active', () => {
    render(<PaginationButton active>1</PaginationButton>)
    const button = screen.getByRole('button', { name: '1' })
    expect(button).toHaveAttribute('aria-current', 'page')
    expect(button).toHaveClass('bg-brand-base')
  })

  it('does not set aria-current when inactive', () => {
    render(<PaginationButton>2</PaginationButton>)
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-current')
  })

  it('blocks click when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <PaginationButton disabled onClick={onClick}>
        3
      </PaginationButton>,
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
