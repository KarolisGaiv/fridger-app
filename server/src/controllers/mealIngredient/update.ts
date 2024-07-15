import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'
import { mealRepository } from '@server/repositories/mealRepository'
import { mealIngredientSchema } from '@server/entities/mealIngredient'
import { z } from 'zod'

export default publicProcedure
  .use(
    provideRepos({
      mealIngredientRepository,
      mealRepository,
    })
  )
  .input(
    z.object({
      mealIngredientId: z.number(),
      updateInfo: mealIngredientSchema.partial(),
    })
  )
  .mutation(
    async ({ input: { mealIngredientId, updateInfo }, ctx: { repos } }) => {
      const result = await repos.mealIngredientRepository.updateMealIngredient(
        mealIngredientId,
        updateInfo
      )

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meal ingredient does not exist',
        })
      }
      return result
    }
  )
