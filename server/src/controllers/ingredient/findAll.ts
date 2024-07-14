import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { ingredientRepository } from '@server/repositories/ingredientRepository'

export default publicProcedure
  .use(
    provideRepos({
      ingredientRepository,
    })
  )
  .query(async ({ ctx: { repos } }) => {
    const ingredients = await repos.ingredientRepository.findAll()
    return ingredients
  })
