import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { TRPCError } from '@trpc/server'
import { generateResponse } from '@server/services/aiBot'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealPlanRepository,
    })
  )
  .query(async ({ ctx: { authUser, repos } }) => {
    const data = await repos.mealPlanRepository.findActiveMealPlan(authUser.id)

    if (!data) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No active meal plan found',
      })
    }

    // const aiResponse = await generateResponse()
    // console.log(aiResponse);

    return data
  })
