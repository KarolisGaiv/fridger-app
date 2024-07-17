import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'
import { mealIngredientSchema } from '@server/entities/mealIngredient'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealIngredientRepository,
    })
  )
  .input(mealIngredientSchema.pick({ id: true }))
  .query(async ({ input, ctx: { repos } }) => {
    const result = await repos.mealIngredientRepository.findMealIngredientById(
      input.id
    )

    if (!result) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No results',
      })
    }
    return result
  })
