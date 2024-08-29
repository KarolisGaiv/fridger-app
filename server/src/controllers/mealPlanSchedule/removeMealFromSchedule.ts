import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealPlanScheduleRepository } from '@server/repositories/mealPlanScheduleRepository'
import { mealToDeleteFromPlanSchema } from '@server/entities/mealPlanSchedule'

export default authenticatedProcedure
  .use(provideRepos({ mealPlanScheduleRepository }))
  .input(mealToDeleteFromPlanSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const { mealName, mealPlan, assignedDay, type } = input
    // console.log(input);

    await repos.mealPlanScheduleRepository.removeMealFromPlan(
      mealName,
      mealPlan,
      authUser.id,
      assignedDay,
      type
    )
  })

//   .query(async ({ input, ctx: { authUser, repos } }) => {
//     const data = await repos.mealPlanScheduleRepository.fetchPlannedMeals(
//       input.mealPlan,
//       authUser.id
//     )

//     return data
//   })
