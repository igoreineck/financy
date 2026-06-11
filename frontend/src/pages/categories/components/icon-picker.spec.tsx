import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { type CategoryIconName, PICKER_ICON_NAMES } from '../icon-map'
import { IconPicker } from './icon-picker'

function Wrapper({ initial }: { initial?: CategoryIconName }) {
  const [value, setValue] = useState<CategoryIconName | null>(initial ?? null)
  return <IconPicker value={value} onChange={setValue} />
}

describe('<IconPicker />', () => {
  it('renders all 16 icons from the picker set', () => {
    render(<Wrapper />)
    for (const name of PICKER_ICON_NAMES) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('marks the clicked icon as selected and keeps only one selected at a time', async () => {
    const user = userEvent.setup()
    render(<Wrapper />)

    const piggy = screen.getByRole('button', { name: 'piggy-bank' })
    const house = screen.getByRole('button', { name: 'house' })

    await user.click(piggy)
    expect(piggy).toHaveAttribute('aria-pressed', 'true')
    expect(house).toHaveAttribute('aria-pressed', 'false')

    await user.click(house)
    expect(house).toHaveAttribute('aria-pressed', 'true')
    expect(piggy).toHaveAttribute('aria-pressed', 'false')
  })
})
