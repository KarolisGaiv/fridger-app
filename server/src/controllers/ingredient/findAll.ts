import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { ingredientRepository } from '@server/repositories/ingredientRepository'

export default authenticatedProcedure
  .use(
    provideRepos({
      ingredientRepository,
    })
  )
  .query(async ({ ctx: { authUser, repos } }) => {
    const ingredients = await repos.ingredientRepository.findAll(authUser.id)
    return ingredients
  })
