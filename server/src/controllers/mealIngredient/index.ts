import { router } from '@server/trpc'
import create from './create'
import findById from './findById'
import findIngredientsByMealId from './findIngredientsByMeal'
import updateMealIngredient from './update'
import deleteIngredientsByMealId from './deleteByMealId'
import deleteById from './deleteById'

export default router({
  create,
  findById,
  findIngredientsByMealId,
  updateMealIngredient,
  deleteIngredientsByMealId,
  deleteById,
})
