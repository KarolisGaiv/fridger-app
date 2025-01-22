import { create } from 'zustand'
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  getUserIdFromToken,
  storeAccessToken,
} from '@/utils/auth'
import { trpc } from '@/trpc'

type UserState = {
  authToken: string | null
  authUserId: number | null
  isLoggedIn: boolean
  login: (userLogin: { email: string; password: string }) => Promise<void>
  logout: () => void
  signup: (userSignup: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  authToken: getStoredAccessToken(localStorage),
  authUserId: null,
  isLoggedIn: !!getStoredAccessToken(localStorage),

  // login action
  login: async (userLogin) => {
    const { accessToken } = await trpc.user.login.mutate(userLogin)
    storeAccessToken(localStorage, accessToken)

    set({
      authToken: accessToken,
      authUserId: getUserIdFromToken(accessToken),
      isLoggedIn: true,
    })
  },

  // logout action
  logout: () => {
    clearStoredAccessToken(localStorage)
    set({
      authToken: null,
      authUserId: null,
      isLoggedIn: false,
    })
  },

  signup: async (userSignup) => {
    await trpc.user.register.mutate(userSignup)
  },
}))
