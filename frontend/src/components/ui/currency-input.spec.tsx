import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CurrencyInput } from './currency-input'

function Harness({ onChange }: { onChange?: (cents: number) => void }) {
  const [value, setValue] = useState(0)
  return (
    <CurrencyInput
      aria-label="Valor"
      value={value}
      onChange={cents => {
        setValue(cents)
        onChange?.(cents)
      }}
    />
  )
}

describe('<CurrencyInput />', () => {
  it('renders the formatted value', () => {
    render(
      <CurrencyInput aria-label="Valor" value={1234} onChange={() => {}} />,
    )
    expect(screen.getByLabelText('Valor')).toHaveValue('R$ 12,34')
  })

  it('shows zero formatted when no value is provided', () => {
    render(<CurrencyInput aria-label="Valor" />)
    expect(screen.getByLabelText('Valor')).toHaveValue('R$ 0,00')
  })

  it('emits cents as the user types digits', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)

    const input = screen.getByLabelText('Valor')
    await user.type(input, '12,34')

    expect(input).toHaveValue('R$ 12,34')
    expect(onChange).toHaveBeenLastCalledWith(1234)
  })

  it('ignores non-digit characters', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)

    const input = screen.getByLabelText('Valor')
    await user.type(input, 'abc99')

    expect(input).toHaveValue('R$ 0,99')
    expect(onChange).toHaveBeenLastCalledWith(99)
  })
})
