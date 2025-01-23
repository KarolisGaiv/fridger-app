import { Navigate } from 'react-router-dom'
import { useUserStore } from '@/stores/user'

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)
  console.log(isLoggedIn)

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
