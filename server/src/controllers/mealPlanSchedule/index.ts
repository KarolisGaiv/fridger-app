import { router } from '@server/trpc'
import create from './create'
import find from './find'
import toggleCompletionStatus from './toggleCompletionStatus'
import removeMealFromSchedule from './removeMealFromSchedule'

export default router({
  create,
  find,
  toggleCompletionStatus,
  removeMealFromSchedule,
})
