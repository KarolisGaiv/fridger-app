import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealPlanScheduleRepository } from '@server/repositories/mealPlanScheduleRepository'
import { mealPlanScheduleSchema } from '@server/entities/mealPlanSchedule'

export default authenticatedProcedure
  .use(provideRepos({ mealPlanScheduleRepository }))
  .input(mealPlanScheduleSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const { mealName, mealPlan, assignedDay, type } = input

    await repos.mealPlanScheduleRepository.create(
      mealName,
      mealPlan,
      assignedDay,
      type,
      authUser.id
    )
  })
