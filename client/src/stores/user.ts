import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  getUserIdFromToken,
  storeAccessToken,
} from '@/utils/auth'
import { trpc } from '@/trpc'
import Cookies from 'js-cookie'

export const useAuth = () => {
  const [authToken, setAuthToken] = useState<string | null>(null)

  // Load the token from localStorage on mount
  useEffect(() => {
    const token = getStoredAccessToken(localStorage)
    setAuthToken(token)
  }, [])

  // Derive computed values
  const authUserId = useMemo(() => {
    return authToken ? getUserIdFromToken(authToken) : null
  }, [authToken])

  const isLoggedIn = useMemo(() => {
    return !!authToken
  }, [authToken])

  // Functions for login, logout, and signup
  const login = useCallback(async (userLogin: { email: string; password: string }) => {
    const { accessToken } = await trpc.user.login.mutate(userLogin)

    // store token in cookies - this is for SRS authentication middleware purpose.
    Cookies.set('token', accessToken, {
      secure: true,
      sameSite: 'strict',
      expires: 7,
    })

    setAuthToken(accessToken)
    storeAccessToken(localStorage, accessToken)
  }, [])

  const logout = useCallback(() => {
    setAuthToken(null)
    clearStoredAccessToken(localStorage)
  }, [])

  const signup = useCallback(
    async (userSignup: {
      email: string
      password: string
      firstName: string
      lastName: string
    }) => {
      await trpc.user.register.mutate(userSignup)
    },
    []
  )

  return {
    authToken,
    authUserId,
    isLoggedIn,
    login,
    logout,
    signup,
  }
}
