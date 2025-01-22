import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/stores/user'

type RequireAuthProps = {
  children: React.ReactNode
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
