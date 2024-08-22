import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealRepository } from '@server/repositories/mealRepository'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { mealPlanSchema } from '@server/entities/mealPlan'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealRepository,
      mealPlanRepository,
    })
  )
  .input(mealPlanSchema.pick({ planName: true }))
  .query(async ({ input, ctx: { authUser, repos } }) => {
    const mealPlanId = await repos.mealPlanRepository.findByPlanName(
      input.planName,
      authUser.id
    )

    if (!mealPlanId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Meal plan with this name not found',
      })
    }

    const result = await repos.mealRepository.findByMealPlanID(
      mealPlanId,
      authUser.id
    )

    if (!result || result.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No meals found in the plan',
      })
    }
    return result
  })
