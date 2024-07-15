import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'
import { mealIngredientSchema } from '@server/entities/mealIngredient'

export default publicProcedure
  .use(
    provideRepos({
      mealIngredientRepository,
    })
  )
  .input(mealIngredientSchema.pick({ mealId: true }))
  .mutation(async ({ input: { mealId }, ctx: { repos } }) => {
    const deletedCount =
      await repos.mealIngredientRepository.deleteIngredientsByMealId(mealId)

    if (deletedCount === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No ingredients found for the specified meal ID',
      })
    }
  })
