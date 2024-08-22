import { router } from '@server/trpc'
import create from './create'
import findByName from './findByName'
import findAll from './findAll'
import updateMeal from './updateMeal'
import deleteMeal from './deleteMeal'
import findByMealPlanId from './findByMealPlanId'

export default router({
  create,
  findByName,
  findAll,
  updateMeal,
  deleteMeal,
  findByMealPlanId,
})
