import { router } from '@server/trpc'
import create from './create'
import findById from './findById'
import findByUserId from './findByUserId'
import update from './update'
import deleteById from './deleteById'
import findActiveMealPlan from './findActiveMealPlan'

export default router({
  create,
  findById,
  findByUserId,
  update,
  deleteById,
  findActiveMealPlan
})
