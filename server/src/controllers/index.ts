import { router } from '../trpc'
import user from './user'
import mealPlan from './mealPlan'
import meal from './meal'
import ingredient from './ingredient'
import mealIngredient from './mealIngredient'
import groceryList from './groceryList'
import fridgeContent from './fridgeContent'

export const appRouter = router({
  user,
  mealPlan,
  meal,
  ingredient,
  mealIngredient,
  groceryList,
  fridgeContent
})

export type AppRouter = typeof appRouter
