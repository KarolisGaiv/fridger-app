import { useState, useEffect } from 'react'
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  getUserIdFromToken,
  storeAccessToken,
} from '@/utils/auth'
import { trpc } from '@/trpc'

export function useAuth() {
  const [authToken, setAuthToken] = useState<string | null>(null)

  // On mount, check if there is a token in localStorage
  useEffect(() => {
    const token = getStoredAccessToken(localStorage)
    setAuthToken(token)
  }, [])

  // Derive authUserId and isLoggedIn from authToken
  const authUserId = authToken ? getUserIdFromToken(authToken) : null
  const isLoggedIn = Boolean(authToken)

  // Login function
  const login = async (userLogin: { email: string; password: string }) => {
    const { accessToken } = await trpc.user.login.mutate(userLogin)

    setAuthToken(accessToken)
    storeAccessToken(localStorage, accessToken)
  }

  // Logout function
  const logout = () => {
    setAuthToken(null)
    clearStoredAccessToken(localStorage)
  }

  // Signup function (could be used elsewhere)
  const signup = trpc.user.register.mutate

  return { authToken, authUserId, isLoggedIn, login, logout, signup }
}
