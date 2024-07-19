import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import provideServices from '@server/trpc/provideServices'
import { fridgeContentRepository } from '@server/repositories/fridgeContentRepository'
import { fridgeContentService } from '@server/services/fridgeContentServices'

export default authenticatedProcedure
  .use(provideRepos({ fridgeContentRepository }))
  .use(provideServices({ fridgeContentService }))
  .mutation(async ({ ctx: { authUser, services } }) => {
    const result = await services.fridgeContentService.placeItemsIntoFridge(
      authUser.id
    )
    return result
  })
