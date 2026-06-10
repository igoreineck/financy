import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tag, type TagColor } from './tag'

const colors: Array<{ color: TagColor; bgClass: string }> = [
  { color: 'gray', bgClass: 'bg-gray-200' },
  { color: 'blue', bgClass: 'bg-blue-light' },
  { color: 'purple', bgClass: 'bg-purple-light' },
  { color: 'pink', bgClass: 'bg-pink-light' },
  { color: 'red', bgClass: 'bg-red-light' },
  { color: 'orange', bgClass: 'bg-orange-light' },
  { color: 'yellow', bgClass: 'bg-yellow-light' },
  { color: 'green', bgClass: 'bg-green-light' },
]

describe('<Tag />', () => {
  it.each(colors)('renders $color with $bgClass', ({ color, bgClass }) => {
    render(<Tag color={color}>Salário</Tag>)
    expect(screen.getByText('Salário')).toHaveClass(bgClass)
  })

  it('falls back to gray when no color is provided', () => {
    render(<Tag>Sem cor</Tag>)
    expect(screen.getByText('Sem cor')).toHaveClass('bg-gray-200')
  })
})
