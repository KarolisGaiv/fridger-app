import { router } from '../trpc'
import user from './user'
import meal from './meal'
import ingredient from './ingredient'

export const appRouter = router({
  user,
  meal,
  ingredient,
})

export type AppRouter = typeof appRouter
