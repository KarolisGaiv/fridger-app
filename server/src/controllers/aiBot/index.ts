import { router } from '@server/trpc'
import create from './create'
import generateMeal from './generateMeal'

export default router({
  create,
  generateMeal,
})
