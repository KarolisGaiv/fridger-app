import { router } from '@server/trpc'
import create from './create'
import findByName from './findByName'
import findAll from './findAll'
import updateMeal from './updateMeal'
import deleteMeal from './deleteMeal'
import findByMealPlanName from './findByMealPlanName'
import toggleCompletionStatus from './toggleCompletionStatus'

export default router({
  create,
  findByName,
  findAll,
  updateMeal,
  deleteMeal,
  findByMealPlanName,
  toggleCompletionStatus,
})
