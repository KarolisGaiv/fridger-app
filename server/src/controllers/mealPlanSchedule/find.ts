import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealPlanScheduleRepository } from '@server/repositories/mealPlanScheduleRepository'
import { mealPlanScheduleSchema } from '@server/entities/mealPlanSchedule'

export default authenticatedProcedure
  .use(provideRepos({ mealPlanScheduleRepository }))
  .input(mealPlanScheduleSchema.pick({ mealPlan: true }))
  .query(async ({ input, ctx: { authUser, repos } }) => {
    const data = await repos.mealPlanScheduleRepository.fetchPlannedMeals(
      input.mealPlan
    )

    return data
  })
