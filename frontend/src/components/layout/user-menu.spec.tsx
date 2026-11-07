import * as authLib from '@/lib/auth'
import { useAuthStore } from '@/store/auth'
import { renderWithProviders } from '@/test/render'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { UserMenu } from './user-menu'

beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn(() => false) as never
  Element.prototype.releasePointerCapture = vi.fn() as never
  Element.prototype.scrollIntoView = vi.fn() as never
})

afterEach(() => {
  vi.restoreAllMocks()
})

function signIn(name = 'Conta Teste') {
  useAuthStore.getState().setSession({
    token: 'tkn',
    user: { id: '1', name, email: 'conta@teste.com' },
  })
}

describe('UserMenu', () => {
  it('shows the avatar initials taken from the user name', () => {
    signIn('Conta Teste')
    renderWithProviders(<UserMenu />)
    expect(screen.getByText('CT')).toBeInTheDocument()
  })

  it('does not render when there is no authenticated user', () => {
    const { container } = renderWithProviders(<UserMenu />)
    expect(container).toBeEmptyDOMElement()
  })

  it('opens a dropdown with profile and sign-out items', async () => {
    signIn()
    const user = userEvent.setup()
    renderWithProviders(<UserMenu />)

    await user.click(
      screen.getByRole('button', { name: /Menu for Conta Teste/i }),
    )

    expect(
      await screen.findByRole('menuitem', { name: /My profile/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /Log out/i }),
    ).toBeInTheDocument()
  })

  it('triggers the logout flow when clicking "Log out"', async () => {
    signIn()
    const logoutSpy = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(authLib, 'useLogout').mockReturnValue(logoutSpy)

    const user = userEvent.setup()
    renderWithProviders(<UserMenu />)

    await user.click(
      screen.getByRole('button', { name: /Menu for Conta Teste/i }),
    )
    await user.click(await screen.findByRole('menuitem', { name: /Log out/i }))

    expect(logoutSpy).toHaveBeenCalledTimes(1)
  })
})
