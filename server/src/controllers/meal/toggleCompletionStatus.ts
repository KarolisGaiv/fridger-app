import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealRepository } from '@server/repositories/mealRepository'
import { mealSchema } from '@server/entities/meal'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealRepository,
    })
  )
  .input(mealSchema.pick({ name: true }))
  .query(async ({ input, ctx: { authUser, repos } }) => {
    await repos.mealRepository.toggleCompletionStatus(input.name, authUser.id)
  })
