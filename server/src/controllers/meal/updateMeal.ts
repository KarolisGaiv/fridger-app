import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealRepository } from '@server/repositories/mealRepository'
import { z } from 'zod'

export default publicProcedure
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
  .mutation(async ({ input: { mealName, updateInfo }, ctx: { repos } }) => {
    const mealToUpdate = await repos.mealRepository.findByName(mealName)

    if (!mealToUpdate) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Meal with this name was not found',
      })
    }

    const updatedMeal = await repos.mealRepository.updateMeal(
      mealName,
      updateInfo
    )
    return updatedMeal
  })
