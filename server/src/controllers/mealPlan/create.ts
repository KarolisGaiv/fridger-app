import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { assertError } from '@server/utils/errors'
import { mealPlanSchema } from '@server/entities/mealPlan'

export default publicProcedure
  .use(
    provideRepos({
      mealPlanRepository,
    })
  )
  .input(mealPlanSchema.omit({ id: true }))
  .mutation(async ({ input, ctx: { repos } }) => {
    const result = await repos.mealPlanRepository
      .create(input)
      .catch((error: unknown) => {
        assertError(error)

        if (error.message.includes('duplicate key')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Meal plan already exist',
            cause: error,
          })
        }
        throw error
      })
    return result
  })
