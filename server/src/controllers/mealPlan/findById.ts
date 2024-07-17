import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { mealPlanSchema } from '@server/entities/mealPlan'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealPlanRepository,
    })
  )
  .input(mealPlanSchema.pick({ id: true }))
  .query(async ({ input: { id }, ctx: { authUser, repos } }) => {
    const mealPlan = await repos.mealPlanRepository.findById(id)

    if (!mealPlan) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Meal plan not found',
      })
    }

    // Ensure the authenticated user owns the meal plan
    if (mealPlan.userId !== authUser.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Not authorized to access this meal plan',
      })
    }

    return mealPlan
  })
