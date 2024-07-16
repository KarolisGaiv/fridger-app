import { router } from '@server/trpc'
import create from './create'
import findById from './findById'
import findByUserId from './findByUserId'

export default router({
  create,
  findById,
  findByUserId,
})
