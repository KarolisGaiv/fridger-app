import { router } from '@server/trpc'
import create from './create'
import findById from './findById'
import findByMealPlanId from './findByMealPlanId'
import update from './update'
import deleteList from './deleteList'
import generateGroceryList from './generateGroceryList'

export default router({
  create,
  findById,
  findByMealPlanId,
  update,
  deleteList,
  generateGroceryList,
})
