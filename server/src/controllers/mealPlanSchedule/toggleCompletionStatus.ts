import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealPlanScheduleRepository } from '@server/repositories/mealPlanScheduleRepository'
import { mealRepository } from '@server/repositories/mealRepository'
import { mealPlanScheduleSchema } from '@server/entities/mealPlanSchedule'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealPlanScheduleRepository,
      mealRepository,
    })
  )
  .input(
    mealPlanScheduleSchema.pick({
      mealName: true,
      assignedDay: true,
      type: true,
    })
  )
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    await repos.mealPlanScheduleRepository.toggleCompletionStatus(
      input.mealName,
      input.assignedDay,
      input.type,
      authUser.id
    )
  })
