import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { mealPlanSchema } from '@server/entities/mealPlan'
import { z } from 'zod'

export default publicProcedure
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
  .mutation(async ({ input, ctx: { repos } }) => {
    const { id, updates } = input
    const updatedMealPlan = await repos.mealPlanRepository.update(id, updates)

    if (!updatedMealPlan || updatedMealPlan === undefined) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Meal plan not found',
      })
    }

    return updatedMealPlan
  })
