import { useUserStore } from '@/stores/user'
import { useCallback } from 'react'
import type { UserState } from '@/stores/user'

export const useLogin = () => {
  const loginSelector = useCallback((state: UserState) => state.login, [])
  const login = useUserStore(loginSelector)

  return { login }
}
