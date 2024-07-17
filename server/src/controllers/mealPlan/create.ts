import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { mealPlanSchema } from '@server/entities/mealPlan'

export default authenticatedProcedure
  .use(provideRepos({ mealPlanRepository }))
  .input(mealPlanSchema.pick({ planName: true }))
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const data = {
      ...input,
      userId: authUser.id,
    }

    const result = await repos.mealPlanRepository.create(data)
    return result
  })
