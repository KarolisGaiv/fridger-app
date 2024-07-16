import { router } from '@server/trpc'
import create from './create'
import findByUser from './findByUser'

export default router({
  create,
  findByUser,
})
