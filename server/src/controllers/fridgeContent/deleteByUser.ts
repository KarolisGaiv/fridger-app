import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { fridgeContentRepository } from '@server/repositories/fridgeContentRepository'

export default authenticatedProcedure
  .use(
    provideRepos({
      fridgeContentRepository,
    })
  )
  .mutation(async ({ ctx: { authUser, repos } }) => {
    await repos.fridgeContentRepository.deleteByUserId(authUser.id)
  })
