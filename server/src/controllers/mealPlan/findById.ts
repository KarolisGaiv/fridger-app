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
  .query(async ({ input: { id }, ctx: { repos } }) => {
    const mealPlan = await repos.mealPlanRepository.findById(id)

    if (!mealPlan) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Meal plan not found',
      })
    }

    return mealPlan
  })
