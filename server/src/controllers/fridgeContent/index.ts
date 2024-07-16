import { router } from '@server/trpc'
import create from './create'
import findByUser from './findByUser'
import findByMealPlan from './findByMealPlan'

export default router({
  create,
  findByUser,
  findByMealPlan,
})
