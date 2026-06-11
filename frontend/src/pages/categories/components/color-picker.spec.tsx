import type { TagColor } from '@/components/ui/tag'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { PICKER_COLOR_NAMES } from '../color-map'
import { ColorPicker } from './color-picker'

function Wrapper() {
  const [value, setValue] = useState<TagColor | null>(null)
  return <ColorPicker value={value} onChange={setValue} />
}

describe('<ColorPicker />', () => {
  it('renders all 7 swatches from the picker set', () => {
    render(<Wrapper />)
    for (const color of PICKER_COLOR_NAMES) {
      expect(screen.getByRole('button', { name: color })).toBeInTheDocument()
    }
  })

  it('selects one color at a time', async () => {
    const user = userEvent.setup()
    render(<Wrapper />)

    const blue = screen.getByRole('button', { name: 'blue' })
    const green = screen.getByRole('button', { name: 'green' })

    await user.click(blue)
    expect(blue).toHaveAttribute('aria-pressed', 'true')
    expect(green).toHaveAttribute('aria-pressed', 'false')

    await user.click(green)
    expect(green).toHaveAttribute('aria-pressed', 'true')
    expect(blue).toHaveAttribute('aria-pressed', 'false')
  })
})
