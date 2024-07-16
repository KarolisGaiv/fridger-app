import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { fridgeContentRepository } from '@server/repositories/fridgeContentRepository'
import { fridgeContentSchema } from '@server/entities/fridgeContent'

export default authenticatedProcedure
  .use(
    provideRepos({
      fridgeContentRepository,
    })
  )
  .input(fridgeContentSchema.omit({ id: true, userId: true }))
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const data = {
      ...input,
      userId: authUser.id,
    }

    const result = await repos.fridgeContentRepository.create(data)
    return result
  })
