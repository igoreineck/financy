import { useAuthStore } from '@/store/auth'
import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { apolloClient } from './apollo'

export function useLogout() {
  const navigate = useNavigate()

  return useCallback(async () => {
    await apolloClient.clearStore()
    useAuthStore.getState().logout()
    navigate('/login', { replace: true })
  }, [navigate])
}
