import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { assertError } from '@server/utils/errors'
import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'
import { mealIngredientSchema } from '@server/entities/mealIngredient'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealIngredientRepository,
    })
  )
  .input(
    mealIngredientSchema.omit({
      id: true,
    })
  )
  .mutation(async ({ input, ctx: { repos } }) => {
    const record = await repos.mealIngredientRepository
      .create(input)
      .catch((error: unknown) => {
        assertError(error)

        if (error.message.includes('duplicate key')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Ingredient already exist',
            cause: error,
          })
        }
        throw error
      })

    return record
  })
