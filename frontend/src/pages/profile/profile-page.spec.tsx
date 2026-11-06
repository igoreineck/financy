import * as authLib from '@/lib/auth'
import { useAuthStore } from '@/store/auth'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, delay, graphql } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProfilePage } from './profile-page'

function meHandler() {
  return graphql.query('Me', () =>
    HttpResponse.json({
      data: {
        me: {
          __typename: 'UserModel',
          id: 'u1',
          name: 'Conta Teste',
          email: 'conta@teste.com',
          createdAt: '2025-01-15T00:00:00Z',
        },
      },
    }),
  )
}

beforeEach(() => {
  useAuthStore.getState().setSession({
    token: 'tkn',
    user: { id: 'u1', name: 'Conta Teste', email: 'conta@teste.com' },
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ProfilePage', () => {
  it('renders the loading skeleton while the query is pending', () => {
    server.use(
      graphql.query('Me', async () => {
        await delay(50)
        return HttpResponse.json({
          data: {
            me: {
              __typename: 'UserModel',
              id: 'u1',
              name: 'Conta Teste',
              email: 'conta@teste.com',
              createdAt: '2025-01-15T00:00:00Z',
            },
          },
        })
      }),
    )
    renderWithProviders(<ProfilePage />)
    expect(screen.getByLabelText('Loading avatar')).toBeInTheDocument()
  })

  it('pre-fills the form with the authenticated user and disables the email', async () => {
    server.use(meHandler())
    renderWithProviders(<ProfilePage />)

    const nameInput = await screen.findByLabelText('Full name')
    expect(nameInput).toHaveValue('Conta Teste')

    const emailInput = screen.getByLabelText('Email')
    expect(emailInput).toHaveValue('conta@teste.com')
    expect(emailInput).toBeDisabled()
    expect(screen.getByText('Email cannot be changed')).toBeInTheDocument()
  })

  it('saves a new name via the updateProfile mutation', async () => {
    const updateCalled = vi.fn()
    server.use(
      meHandler(),
      graphql.mutation('UpdateProfile', async ({ variables }) => {
        updateCalled(variables)
        return HttpResponse.json({
          data: {
            updateProfile: {
              __typename: 'UserModel',
              id: 'u1',
              name: (variables.data as { name: string }).name,
              email: 'conta@teste.com',
              createdAt: '2025-01-15T00:00:00Z',
            },
          },
        })
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<ProfilePage />)

    const nameInput = await screen.findByLabelText('Full name')
    await user.clear(nameInput)
    await user.type(nameInput, 'Igor Eineck')
    await user.click(screen.getByRole('button', { name: /Save changes/i }))

    await waitFor(() =>
      expect(useAuthStore.getState().user?.name).toBe('Igor Eineck'),
    )
    expect(updateCalled).toHaveBeenCalledWith({ data: { name: 'Igor Eineck' } })
  })

  it('blocks submission when the name is blank', async () => {
    server.use(meHandler())
    const user = userEvent.setup()
    renderWithProviders(<ProfilePage />)

    const nameInput = await screen.findByLabelText('Full name')
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: /Save changes/i }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
  })

  it('triggers the logout flow when clicking "Log out"', async () => {
    server.use(meHandler())
    const logoutSpy = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(authLib, 'useLogout').mockReturnValue(logoutSpy)

    const user = userEvent.setup()
    renderWithProviders(<ProfilePage />)

    await user.click(await screen.findByRole('button', { name: /Log out/i }))
    expect(logoutSpy).toHaveBeenCalledTimes(1)
  })
})
