import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import provideServices from '@server/trpc/provideServices'
import { fridgeContentRepository } from '@server/repositories/fridgeContentRepository'
import { fridgeContentService } from '@server/services/fridgeContentServices'
import { mealPlanSchema } from '@server/entities/mealPlan'

export default authenticatedProcedure
  .use(provideRepos({ fridgeContentRepository }))
  .use(provideServices({ fridgeContentService }))
  .input(mealPlanSchema.pick({ planName: true }))
  .mutation(async ({ input, ctx: { authUser, services } }) => {
    const result = await services.fridgeContentService.placeItemsIntoFridge(
      input.planName,
      authUser.id
    )
    return result
  })
