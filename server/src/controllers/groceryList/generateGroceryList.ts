import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import provideServices from '@server/trpc/provideServices'
import { groceryListRepository } from '@server/repositories/groceryListRepository'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'
import { groceryListServices } from '@server/services/groceryListServices'

export default authenticatedProcedure
  .use(
    provideRepos({
      groceryListRepository,
      mealPlanRepository,
      mealIngredientRepository,
    })
  )
  .use(
    provideServices({
      groceryListServices,
    })
  )
  .mutation(async ({ ctx: { authUser, services, repos } }) => {
    // Fetch all meal plans for the user
    const mealPlans = await repos.mealPlanRepository.findByUserId(authUser.id)
    if (mealPlans.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No meal plan found for the user.',
      })
    }

    // Find the active meal plan
    const activeMealPlan = mealPlans.find((plan) => plan.isActive)
    if (!activeMealPlan) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No active meal plan found for the user.',
      })
    }

    // Perform the ownership check
    if (activeMealPlan.userId !== authUser.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Not authorized to access this meal plan',
      })
    }

    const groceryList = await services.groceryListServices.generateGroceryList(
      authUser.id
    )

    const savedGroceryList =
      await repos.groceryListRepository.create(groceryList)

    return savedGroceryList
  })
