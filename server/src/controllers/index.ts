import { router } from '../trpc'
import user from './user'
import meal from './meal'

export const appRouter = router({
  user,
  meal,
})

export type AppRouter = typeof appRouter
