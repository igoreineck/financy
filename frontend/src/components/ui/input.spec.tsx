import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Mail } from 'lucide-react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { Input } from './input'

describe('<Input />', () => {
  it('reflects controlled value', () => {
    render(<Input value="foo@bar.com" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('foo@bar.com')
  })

  it('renders the leading icon when provided', () => {
    render(<Input icon={<Mail data-testid="icon" />} placeholder="email" />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('sets aria-invalid when error is true', () => {
    render(<Input error placeholder="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not accept input when disabled', async () => {
    const user = userEvent.setup()
    render(<Input disabled placeholder="email" />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'hello')
    expect(input).toHaveValue('')
    expect(input).toBeDisabled()
  })

  it('forwards ref to the underlying input', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} placeholder="email" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
