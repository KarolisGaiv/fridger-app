import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealRepository } from '@server/repositories/mealRepository'
import { mealSchema } from '@server/entities/meal'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealRepository,
    })
  )
  .input(
    mealSchema.pick({
      name: true,
    })
  )
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const mealToDelete = await repos.mealRepository.findByName(
      input.name,
      authUser.id
    )

    if (!mealToDelete) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Meal with this name not found',
      })
    }

    await repos.mealRepository.deleteMeal(input.name, authUser.id)
  })
