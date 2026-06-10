import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Trash2 } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { IconButton } from './icon-button'

describe('<IconButton />', () => {
  it('renders outline variant by default', () => {
    render(
      <IconButton aria-label="Editar">
        <Trash2 />
      </IconButton>,
    )
    const button = screen.getByRole('button', { name: 'Editar' })
    expect(button).toHaveClass('border-gray-300')
  })

  it('renders danger variant with red text', () => {
    render(
      <IconButton variant="danger" aria-label="Deletar">
        <Trash2 />
      </IconButton>,
    )
    expect(screen.getByRole('button')).toHaveClass('text-danger')
  })

  it('invokes onClick on click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <IconButton aria-label="Editar" onClick={onClick}>
        <Trash2 />
      </IconButton>,
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <IconButton aria-label="Editar" disabled onClick={onClick}>
        <Trash2 />
      </IconButton>,
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
