import { AppLayout } from '@/components/layout/app-layout'
import { Toaster } from '@/components/ui/sonner'
import { apolloClient } from '@/lib/apollo'
import { useAuthStore } from '@/store/auth'
import { server } from '@/test/msw/server'
import { ApolloProvider } from '@apollo/client/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, graphql } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { ProfilePage } from './profile-page'

beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn(() => false) as never
  Element.prototype.releasePointerCapture = vi.fn() as never
  Element.prototype.scrollIntoView = vi.fn() as never
})

afterEach(async () => {
  await apolloClient.clearStore()
})

function setupServer() {
  server.use(
    graphql.query('Me', ({ request }) => {
      const auth = request.headers.get('authorization')
      if (!auth || !auth.startsWith('Bearer ')) {
        return HttpResponse.json(
          { errors: [{ message: 'Não autenticado' }] },
          { status: 200 },
        )
      }
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
}

function renderApp() {
  return render(
    <ApolloProvider client={apolloClient}>
      <MemoryRouter initialEntries={['/perfil']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>
          <Route path="/login" element={<div>Tela de login</div>} />
        </Routes>
        <Toaster />
      </MemoryRouter>
    </ApolloProvider>,
  )
}

describe('Logout — fluxo completo', () => {
  it('limpa store, limpa Apollo cache e redireciona para /login', async () => {
    useAuthStore.getState().setSession({
      token: 'tkn-abc',
      user: { id: 'u1', name: 'Conta Teste', email: 'conta@teste.com' },
    })
    setupServer()

    const user = userEvent.setup()
    renderApp()

    expect(await screen.findByText('conta@teste.com')).toBeInTheDocument()

    await user.click(
      screen.getAllByRole('button', { name: /Sair da conta/i })[0],
    )

    expect(await screen.findByText('Tela de login')).toBeInTheDocument()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    // Persisted snapshot only carries the cleared state — refreshing the
    // page wouldn't restore an authenticated session.
    const persisted = localStorage.getItem('financy-auth')
    if (persisted !== null) {
      expect(persisted).not.toContain('"token":"tkn-abc"')
      expect(persisted).toContain('"token":null')
    }
    expect(apolloClient.cache.extract()).toEqual({})
  })
})
