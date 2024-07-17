import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { mealPlanSchema } from '@server/entities/mealPlan'
import { z } from 'zod'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealPlanRepository,
    })
  )
  .input(
    z.object({
      id: z.number(),
      updates: mealPlanSchema.partial(),
    })
  )
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const { id, updates } = input
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

    const updatedMealPlan = await repos.mealPlanRepository.update(id, updates)

    if (!updatedMealPlan || updatedMealPlan === undefined) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Meal plan not found',
      })
    }
    return updatedMealPlan
  })
