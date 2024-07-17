import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealPlanRepository,
    })
  )
  .query(async ({ ctx: { authUser, repos } }) => {
    const mealPlans = await repos.mealPlanRepository.findByUserId(authUser.id)
    return mealPlans
  })
