import { router } from '../trpc'
import user from './user'
import meal from './meal'
import ingredient from './ingredient'
import mealIngredient from './mealIngredient'

export const appRouter = router({
  user,
  meal,
  ingredient,
  mealIngredient,
})

export type AppRouter = typeof appRouter
