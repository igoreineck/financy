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
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('exposes a Criar conta CTA in the footer that links to /cadastro', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: /Criar conta/i })).toHaveAttribute(
      'href',
      '/cadastro',
    )
  })

  it('toggles password visibility via the eye button', async () => {
    const user = userEvent.setup()
    renderLogin()

    const passwordInput = screen.getByLabelText('Senha')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /Mostrar senha/i }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /Ocultar senha/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('blocks submit when fields are invalid', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Email inválido')).toBeInTheDocument()
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

    await user.type(screen.getByLabelText('E-mail'), 'igor@example.com')
    await user.type(screen.getByLabelText('Senha'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('dashboard placeholder')).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBe('jwt-token')
    expect(useAuthStore.getState().user?.email).toBe('igor@example.com')
  })

  it('shows a toast when the backend rejects the credentials', async () => {
    server.use(
      graphql.mutation('Login', () =>
        HttpResponse.json({
          errors: [{ message: 'Senha inválida!' }],
        }),
      ),
    )

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('E-mail'), 'igor@example.com')
    await user.type(screen.getByLabelText('Senha'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Senha inválida!')).toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
