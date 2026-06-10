import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'

describe('<Button />', () => {
  it('renders solid variant by default', () => {
    render(<Button>Salvar</Button>)
    const button = screen.getByRole('button', { name: 'Salvar' })
    expect(button).toHaveClass('bg-brand-base')
  })

  it('renders outline variant', () => {
    render(<Button variant="outline">Cancelar</Button>)
    const button = screen.getByRole('button', { name: 'Cancelar' })
    expect(button).toHaveClass('border', 'bg-white')
  })

  it('applies size classes', () => {
    const { rerender } = render(<Button size="md">md</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-12')
    rerender(<Button size="sm">sm</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-10')
  })

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Salvar
      </Button>,
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('forwards classes to child element via asChild', () => {
    render(
      <Button asChild>
        <a href="/foo">Ir</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Ir' })
    expect(link).toHaveClass('bg-brand-base')
    expect(link).toHaveAttribute('href', '/foo')
  })
})
