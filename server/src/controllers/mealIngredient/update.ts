import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'
import { mealIngredientSchema } from '@server/entities/mealIngredient'
import { z } from 'zod'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealIngredientRepository,
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
      const updatedMealIngredient =
        await repos.mealIngredientRepository.updateMealIngredient(
          mealIngredientId,
          updateInfo
        )

      if (!updatedMealIngredient) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meal ingredient does not exist',
        })
      }

      return updatedMealIngredient
    }
  )
