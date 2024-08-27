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
  .input(mealPlanScheduleSchema.pick({ mealName: true }))
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    // const mealData = await repos.mealRepository.findByName(input.mealName, authUser.id)

    // if (mealData?.user !== authUser.id) {
    //     throw new TRPCError({
    //         code: "FORBIDDEN",
    //         message: "You are not allowed to change this"
    //     })
    // }

    // await repos.mealPlanScheduleRepository.toggleCompletionStatus(mealData.id, authUser.id)

    await repos.mealPlanScheduleRepository.toggleCompletionStatus(
      input.mealName,
      authUser.id
    )
  })
