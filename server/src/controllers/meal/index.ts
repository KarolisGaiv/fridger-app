import { router } from '@server/trpc'
import create from './create'
import findByName from './findByName'

export default router({
  create,
  findByName,
})
