import { Toaster } from '@/components/ui/sonner'
import { apolloClient } from '@/lib/apollo'
import { useAuthStore } from '@/store/auth'
import { server } from '@/test/msw/server'
import { ApolloProvider } from '@apollo/client/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, graphql } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { Login } from './login'

function renderLogin() {
  return render(
    <ApolloProvider client={apolloClient}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>dashboard placeholder</div>} />
        </Routes>
      </MemoryRouter>
      <Toaster />
    </ApolloProvider>,
  )
}

afterEach(async () => {
  await apolloClient.clearStore()
})

describe('<Login />', () => {
  it('renders email, password and the entrar button', () => {
    renderLogin()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('exposes a Create account CTA in the footer that links to /signup', () => {
    renderLogin()
    expect(
      screen.getByRole('link', { name: /Create account/i }),
    ).toHaveAttribute('href', '/signup')
  })

  it('toggles password visibility via the eye button', async () => {
    const user = userEvent.setup()
    renderLogin()

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /Show password/i }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /Hide password/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('blocks submit when fields are invalid', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Invalid email')).toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('logs in successfully and navigates to /', async () => {
    server.use(
      graphql.mutation('Login', () =>
        HttpResponse.json({
          data: {
            login: {
              __typename: 'AuthOutput',
              token: 'jwt-token',
              user: {
                __typename: 'UserModel',
                id: '1',
                name: 'Igor',
                email: 'igor@example.com',
              },
            },
          },
        }),
      ),
    )

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'igor@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('dashboard placeholder')).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBe('jwt-token')
    expect(useAuthStore.getState().user?.email).toBe('igor@example.com')
  })

  it('shows a toast when the backend rejects the credentials', async () => {
    server.use(
      graphql.mutation('Login', () =>
        HttpResponse.json({
          errors: [{ message: 'Invalid password!' }],
        }),
      ),
    )

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'igor@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Invalid password!')).toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
