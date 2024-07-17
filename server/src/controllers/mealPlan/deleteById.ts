import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { mealPlanSchema } from '@server/entities/mealPlan'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealPlanRepository,
    })
  )
  .input(mealPlanSchema.pick({ id: true }))
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const { id } = input
    const mealPlan = await repos.mealPlanRepository.findById(id)

    if (!mealPlan) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Meal plan not found',
      })
    }

    // Ensure the authenticated user owns the meal plan
    if (mealPlan?.userId !== authUser.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Not authorized to access this meal plan',
      })
    }

    await repos.mealPlanRepository.deleteById(id)
    return {
      message: 'Meal plan deleted successfully',
    }
  })
