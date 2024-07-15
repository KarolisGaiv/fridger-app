import { router } from '@server/trpc'
import create from './create'
import findById from './findById'

export default router({
  create,
  findById,
})
