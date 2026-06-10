import { useAuthStore } from '@/store/auth'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ProtectedRoute } from './protected-route'

function setup() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>protected content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('<ProtectedRoute />', () => {
  it('redirects to /login when not authenticated', () => {
    setup()
    expect(screen.getByText('login page')).toBeInTheDocument()
    expect(screen.queryByText('protected content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    useAuthStore.getState().setSession({
      token: 'jwt',
      user: { id: '1', name: 'Igor', email: 'i@x.com' },
    })
    setup()
    expect(screen.getByText('protected content')).toBeInTheDocument()
  })
})
