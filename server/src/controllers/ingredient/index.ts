import { router } from '@server/trpc'
import create from './create'
import findByName from './findByName'
import findAll from './findAll'

export default router({
  create,
  findByName,
  findAll
})
