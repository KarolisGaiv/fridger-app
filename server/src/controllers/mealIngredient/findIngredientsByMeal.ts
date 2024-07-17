import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'
import { mealRepository } from '@server/repositories/mealRepository'
import { mealIngredientSchema } from '@server/entities/mealIngredient'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealIngredientRepository,
      mealRepository,
    })
  )
  .input(
    mealIngredientSchema.pick({
      mealId: true,
    })
  )
  .query(async ({ input, ctx: { repos } }) => {
    const meal = await repos.mealRepository.findById(input.mealId)

    if (!meal) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Meal does not exist',
      })
    }

    const response =
      await repos.mealIngredientRepository.findIngredientsByMealId(input.mealId)

    return response
  })
