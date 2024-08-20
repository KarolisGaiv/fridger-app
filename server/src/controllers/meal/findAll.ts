import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealRepository } from '@server/repositories/mealRepository'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealRepository,
    })
  )
  .query(async ({ ctx: { authUser, repos } }) => {
    const meals = await repos.mealRepository.findAll(authUser.id)
    return meals
  })
