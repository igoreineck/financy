import '@testing-library/jest-dom/vitest'
import { useAuthStore } from '@/store/auth'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { server } from './msw/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

beforeEach(() => {
  useAuthStore.getState().logout()
  localStorage.clear()
  sessionStorage.clear()
})
