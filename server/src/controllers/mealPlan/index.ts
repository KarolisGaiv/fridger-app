import { router } from '@server/trpc'
import create from './create'
import findById from './findById'
import findByUserId from './findByUserId'
import update from './update'
import deleteById from './deleteById'

export default router({
  create,
  findById,
  findByUserId,
  update,
  deleteById,
})
