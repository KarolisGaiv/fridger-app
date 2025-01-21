import { useAuth } from '@/stores/user'

export const useAuthenticate = () => {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return { name: 'Login' }
  }

  return true
}
