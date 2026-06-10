import { useAuthStore } from '@/store/auth'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { PublicRoute } from './public-route'

function setup() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/" element={<div>home page</div>} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <div>login form</div>
            </PublicRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('<PublicRoute />', () => {
  it('renders children when not authenticated', () => {
    setup()
    expect(screen.getByText('login form')).toBeInTheDocument()
  })

  it('redirects to / when authenticated', () => {
    useAuthStore.getState().setSession({
      token: 'jwt',
      user: { id: '1', name: 'Igor', email: 'i@x.com' },
    })
    setup()
    expect(screen.getByText('home page')).toBeInTheDocument()
    expect(screen.queryByText('login form')).not.toBeInTheDocument()
  })
})
