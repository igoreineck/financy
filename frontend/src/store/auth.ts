import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SESSION_KEY = 'financy-auth'
const REMEMBER_KEY = 'financy-remember-v1'

function shouldRemember(): boolean {
  return localStorage.getItem(REMEMBER_KEY) !== 'false'
}

const dualStorage: Storage = {
  get length() {
    return shouldRemember() ? localStorage.length : sessionStorage.length
  },
  clear: () => {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
  },
  key: index => (shouldRemember() ? localStorage : sessionStorage).key(index),
  getItem: key =>
    (shouldRemember() ? localStorage : sessionStorage).getItem(key),
  setItem: (key, value) =>
    (shouldRemember() ? localStorage : sessionStorage).setItem(key, value),
  removeItem: key => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

type AuthUser = {
  id: string
  name: string
  email: string
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  setSession: (data: {
    token: string
    user: AuthUser
    remember?: boolean
  }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setSession: ({ token, user, remember = true }) => {
        localStorage.setItem(REMEMBER_KEY, String(remember))
        // Drop any leftover session from the other storage so a previous
        // "remember" choice doesn't leak across logins.
        if (remember) sessionStorage.removeItem(SESSION_KEY)
        else localStorage.removeItem(SESSION_KEY)
        set({ token, user, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem(REMEMBER_KEY)
        localStorage.removeItem(SESSION_KEY)
        sessionStorage.removeItem(SESSION_KEY)
        set({ token: null, user: null, isAuthenticated: false })
      },
    }),
    {
      name: SESSION_KEY,
      storage: createJSONStorage(() => dualStorage),
    },
  ),
)
