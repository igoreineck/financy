import * as authLib from '@/lib/auth'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, delay, graphql } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProfilePage } from './profile-page'

function setupMe() {
  server.use(
    graphql.query('Me', () =>
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
    ),
  )
}

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
    expect(screen.getByLabelText('Carregando avatar')).toBeInTheDocument()
  })

  it('shows the user name and email returned by the me query', async () => {
    setupMe()
    renderWithProviders(<ProfilePage />)
    expect(await screen.findByText('Conta Teste')).toBeInTheDocument()
    expect(screen.getByText('conta@teste.com')).toBeInTheDocument()
    expect(screen.getByText(/Conta criada em/i)).toBeInTheDocument()
  })

  it('triggers the logout flow when clicking "Sair da conta"', async () => {
    setupMe()
    const logoutSpy = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(authLib, 'useLogout').mockReturnValue(logoutSpy)

    const user = userEvent.setup()
    renderWithProviders(<ProfilePage />)

    await user.click(
      await screen.findByRole('button', { name: /Sair da conta/i }),
    )
    expect(logoutSpy).toHaveBeenCalledTimes(1)
  })
})
