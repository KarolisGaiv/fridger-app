import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealRepository } from '@server/repositories/mealRepository'
import { z } from 'zod'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealRepository,
    })
  )
  .input(
    z.object({
      mealName: z.string().min(1),
      updateInfo: z
        .object({
          name: z.string().min(1).optional(),
          calories: z.number().optional(),
        })
        .strict(), // ensure no other properties
    })
  )
  .mutation(
    async ({ input: { mealName, updateInfo }, ctx: { authUser, repos } }) => {
      const mealToUpdate = await repos.mealRepository.findByName(
        mealName,
        authUser.id
      )

      if (!mealToUpdate) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meal with this name was not found',
        })
      }

      const updatedMeal = await repos.mealRepository.updateMeal(
        authUser.id,
        mealName,
        updateInfo
      )
      return updatedMeal
    }
  )
