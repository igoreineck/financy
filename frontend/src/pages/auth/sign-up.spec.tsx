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
import { SignUp } from './sign-up'

function renderSignUp() {
  return render(
    <ApolloProvider client={apolloClient}>
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
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

describe('<SignUp />', () => {
  it('blocks submit when password is too short', async () => {
    const user = userEvent.setup()
    renderSignUp()
    await user.type(screen.getByLabelText('Full name'), 'Igor')
    await user.type(screen.getByLabelText('Email'), 'igor@example.com')
    await user.type(screen.getByLabelText('Password'), '1234567')
    await user.type(screen.getByLabelText('Confirm password'), '1234567')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(
      await screen.findByText('Password must be at least 8 characters'),
    ).toBeInTheDocument()
  })

  it('toggles password visibility via the eye button', async () => {
    const user = userEvent.setup()
    renderSignUp()

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggle = screen.getAllByRole('button', { name: /Show password/i })[0]
    await user.click(toggle)
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(
      screen.getAllByRole('button', { name: /Hide password/i })[0],
    )
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('blocks submit when passwords do not match', async () => {
    const user = userEvent.setup()
    renderSignUp()
    await user.type(screen.getByLabelText('Full name'), 'Igor')
    await user.type(screen.getByLabelText('Email'), 'igor@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret1234')
    await user.type(screen.getByLabelText('Confirm password'), 'other12345')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(
      await screen.findByText('Passwords do not match'),
    ).toBeInTheDocument()
  })

  it('registers successfully and navigates to /', async () => {
    server.use(
      graphql.mutation('Register', () =>
        HttpResponse.json({
          data: {
            register: {
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
    renderSignUp()

    await user.type(screen.getByLabelText('Full name'), 'Igor')
    await user.type(screen.getByLabelText('Email'), 'igor@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret1234')
    await user.type(screen.getByLabelText('Confirm password'), 'secret1234')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(await screen.findByText('dashboard placeholder')).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBe('jwt-token')
  })

  it('shows a toast when the backend rejects the email', async () => {
    server.use(
      graphql.mutation('Register', () =>
        HttpResponse.json({
          errors: [{ message: 'Email already registered!' }],
        }),
      ),
    )

    const user = userEvent.setup()
    renderSignUp()

    await user.type(screen.getByLabelText('Full name'), 'Igor')
    await user.type(screen.getByLabelText('Email'), 'igor@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret1234')
    await user.type(screen.getByLabelText('Confirm password'), 'secret1234')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(
      await screen.findByText('Email already registered!'),
    ).toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
