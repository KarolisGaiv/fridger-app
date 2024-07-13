import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { mealRepository } from '@server/repositories/mealRepository'

export default publicProcedure
  .use(
    provideRepos({
      mealRepository,
    })
  )
  .query(async ({ ctx: { repos } }) => {
    const meals = await repos.mealRepository.findAll()
    return meals
  })
