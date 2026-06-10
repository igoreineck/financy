import { describe, expect, it } from 'vitest'
import { useAuthStore } from './auth'

const session = {
  token: 'jwt-token',
  user: { id: '1', name: 'Igor', email: 'igor@example.com' },
}

describe('useAuthStore', () => {
  it('starts empty', () => {
    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('setSession populates token, user and isAuthenticated', () => {
    useAuthStore.getState().setSession(session)
    const state = useAuthStore.getState()
    expect(state.token).toBe(session.token)
    expect(state.user).toEqual(session.user)
    expect(state.isAuthenticated).toBe(true)
  })

  it('logout clears the session', () => {
    useAuthStore.getState().setSession(session)
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('persists the session to localStorage when remember is true (default)', () => {
    useAuthStore.getState().setSession(session)
    const stored = localStorage.getItem('financy-auth')
    expect(stored).toContain('"token":"jwt-token"')
    expect(stored).toContain('"email":"igor@example.com"')
    expect(sessionStorage.getItem('financy-auth')).toBeNull()
    expect(localStorage.getItem('financy-remember-v1')).toBe('true')
  })

  it('persists the session to sessionStorage when remember is false', () => {
    useAuthStore.getState().setSession({ ...session, remember: false })
    expect(localStorage.getItem('financy-auth')).toBeNull()
    const stored = sessionStorage.getItem('financy-auth')
    expect(stored).toContain('"token":"jwt-token"')
    expect(localStorage.getItem('financy-remember-v1')).toBe('false')
  })

  it('moves the session between storages when remember preference changes', () => {
    useAuthStore.getState().setSession(session)
    expect(localStorage.getItem('financy-auth')).not.toBeNull()
    useAuthStore.getState().setSession({ ...session, remember: false })
    expect(localStorage.getItem('financy-auth')).toBeNull()
    expect(sessionStorage.getItem('financy-auth')).not.toBeNull()
  })
})
