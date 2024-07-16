import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { mealPlanSchema } from '@server/entities/mealPlan'

export default publicProcedure
  .use(
    provideRepos({
      mealPlanRepository,
    })
  )
  .input(mealPlanSchema.pick({ id: true }))
  .mutation(async ({ input, ctx: { repos } }) => {
    const { id } = input
    const mealPlan = await repos.mealPlanRepository.findById(id)

    if (!mealPlan) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Meal plan not found',
      })
    }

    await repos.mealPlanRepository.deleteById(id)

    return {
      message: 'Meal plan deleted successfully',
    }
  })
