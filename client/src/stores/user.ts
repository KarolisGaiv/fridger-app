import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  getUserIdFromToken,
  storeAccessToken,
} from '@/utils/auth'
import { trpc } from '@/trpc'

type Meal = {
  name: string
  calories: number
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
  assignedDay: number
  completed: boolean
}

export type UserState = {
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
  activePlan: string | null
  getActiveMealPlan: () => Promise<string>
  plannedMeals: Meal[]
  getPlannedMeals: () => Promise<void>
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => {
      // Get the stored access token
      const storedToken = getStoredAccessToken(localStorage)

      return {
        authToken: storedToken,
        authUserId: storedToken ? getUserIdFromToken(storedToken) : null,
        isLoggedIn: !!storedToken,
        activePlan: null,
        plannedMeals: [],

        // login action
        login: async (userLogin) => {
          const { accessToken } = await trpc.user.login.mutate(userLogin)
          storeAccessToken(localStorage, accessToken)

          const authUserId = getUserIdFromToken(accessToken)

          // Fetch active meal plan
          const activePlan = await trpc.mealPlan.findActiveMealPlan.query()

          // Fetch planned meals for the active meal plan
          const meals = await trpc.mealPlanSchedule.find.query({ mealPlan: activePlan })

          set({
            authToken: accessToken,
            authUserId,
            isLoggedIn: true,
            activePlan,
            plannedMeals: meals,
          })
        },

        // logout action
        logout: () => {
          clearStoredAccessToken(localStorage)
          set({
            authToken: null,
            authUserId: null,
            isLoggedIn: false,
            activePlan: null,
            plannedMeals: [],
          })
        },

        signup: async (userSignup) => {
          await trpc.user.register.mutate(userSignup)
        },

        getActiveMealPlan: async () => {
          const planName = await trpc.mealPlan.findActiveMealPlan.query()
          set({
            activePlan: planName,
          })
          return planName
        },

        getPlannedMeals: async () => {
          try {
            const activePlan = get().activePlan
            if (!activePlan) {
              throw new Error('No active meal plan is set.')
            }
            const meals = await trpc.mealPlanSchedule.find.query({ mealPlan: activePlan })
            set({ plannedMeals: meals })
          } catch (error) {
            console.error('Error fetching planned meals:', error)
            throw error
          }
        },
      }
    },
    {
      name: 'user-store', // Key in localStorage
      partialize: (state) => ({
        authToken: state.authToken,
        authUserId: state.authUserId,
        isLoggedIn: state.isLoggedIn,
        activePlan: state.activePlan,
        plannedMeals: state.plannedMeals,
      }),
    }
  )
)
