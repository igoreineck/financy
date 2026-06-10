import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

// jsdom doesn't implement pointer capture / scrollIntoView — Radix Select needs both.
beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn(() => false) as never
  Element.prototype.releasePointerCapture = vi.fn() as never
  Element.prototype.scrollIntoView = vi.fn() as never
})

function ControlledSelect({
  onValueChange,
}: {
  onValueChange?: (value: string) => void
}) {
  const [value, setValue] = useState<string>('')
  return (
    <Select
      value={value}
      onValueChange={next => {
        setValue(next)
        onValueChange?.(next)
      }}
    >
      <SelectTrigger aria-label="Categoria">
        <SelectValue placeholder="Escolha" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="opt-1">Option 1</SelectItem>
        <SelectItem value="opt-2">Option 2</SelectItem>
      </SelectContent>
    </Select>
  )
}

describe('<Select />', () => {
  it('opens the dropdown and selects an option', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ControlledSelect onValueChange={onValueChange} />)

    await user.click(screen.getByRole('combobox', { name: 'Categoria' }))
    await user.click(await screen.findByText('Option 2'))

    expect(onValueChange).toHaveBeenCalledWith('opt-2')
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })
})
