import { router } from '@server/trpc'
import create from './create'
import findById from './findById'
import findIngredientsByMealId from './findIngredientsByMeal'

export default router({
  create,
  findById,
  findIngredientsByMealId,
})
