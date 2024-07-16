import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { fridgeContentRepository } from '@server/repositories/fridgeContentRepository'

export default authenticatedProcedure
  .use(
    provideRepos({
      fridgeContentRepository,
    })
  )
  .query(async ({ ctx: { authUser, repos } }) => {
    const result = await repos.fridgeContentRepository.findByUser(authUser.id)
    return result
  })
