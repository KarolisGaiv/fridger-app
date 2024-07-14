import { router } from '@server/trpc'
import create from './create'
import findByName from './findByName'
import findAll from './findAll'
import updateIngredient from './updateIngredient'
import deleteIngredient from './deleteIngredient'

export default router({
  create,
  findByName,
  findAll,
  updateIngredient,
  deleteIngredient,
})
