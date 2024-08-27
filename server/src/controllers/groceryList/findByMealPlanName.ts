import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { groceryListRepository } from '@server/repositories/groceryListRepository'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { groceryListSchema } from '@server/entities/groceryList'
import { mealPlanSchema } from '@server/entities/mealPlan'

export default authenticatedProcedure
  .use(
    provideRepos({
      groceryListRepository,
      mealPlanRepository,
    })
  )
  .input(mealPlanSchema.pick({ planName: true }))
  .query(async ({ input, ctx: { authUser, repos } }) => {
    const planId = await repos.mealPlanRepository.findByPlanName(
      input.planName,
      authUser.id
    )

    if (!planId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'You currently do not have active meal plan',
      })
    }

    const result = await repos.groceryListRepository.findByMealPlanId(planId)

    if (result.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Grocery list not found',
      })
    }
    return result
  })
