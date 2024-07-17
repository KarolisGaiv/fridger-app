import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealRepository } from '@server/repositories/mealRepository'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealRepository,
    })
  )
  .query(async ({ ctx: { repos } }) => {
    const meals = await repos.mealRepository.findAll()
    return meals
  })
