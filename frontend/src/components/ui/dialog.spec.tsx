import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './dialog'

function ControlledDialog({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        setOpen(value)
        onOpenChange?.(value)
      }}
    >
      <DialogTrigger>Abrir</DialogTrigger>
      <DialogContent>
        <DialogTitle>Confirmar</DialogTitle>
        <DialogDescription>Tem certeza?</DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

describe('<Dialog />', () => {
  it('opens when the trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<ControlledDialog />)
    expect(screen.queryByText('Confirmar')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByText('Confirmar')).toBeInTheDocument()
  })

  it('closes when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ControlledDialog onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(screen.queryByText('Confirmar')).not.toBeInTheDocument()
  })

  it('closes when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ControlledDialog onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })
})
