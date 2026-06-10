import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('<App />', () => {
  it('renderiza o placeholder "Financy"', () => {
    render(<App />)
    expect(screen.getByText('Financy')).toBeInTheDocument()
  })
})
