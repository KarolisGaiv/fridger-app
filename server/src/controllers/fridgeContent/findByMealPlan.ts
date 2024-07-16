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
  .input(fridgeContentSchema.pick({ mealPlan: true }))
  .query(async ({ input, ctx: { repos } }) => {
    const result = await repos.fridgeContentRepository.findByMealPlan(
      input.mealPlan
    )
    return result
  })
