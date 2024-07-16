import { router } from '@server/trpc'
import create from './create'
import findByUser from './findByUser'
import findByMealPlan from './findByMealPlan'
import deleteByUser from './deleteByUser'

export default router({
  create,
  findByUser,
  findByMealPlan,
  deleteByUser,
})
