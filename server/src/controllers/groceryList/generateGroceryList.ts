import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import provideServices from '@server/trpc/provideServices'
import { groceryListRepository } from '@server/repositories/groceryListRepository'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'
import { groceryListServices } from '@server/services/groceryListServices'
import { mealPlanSchema } from '@server/entities/mealPlan'
import { mealPlanScheduleRepository } from '@server/repositories/mealPlanScheduleRepository'

export default authenticatedProcedure
  .use(
    provideRepos({
      groceryListRepository,
      mealPlanRepository,
      mealIngredientRepository,
      mealPlanScheduleRepository,
    })
  )
  .input(mealPlanSchema.pick({ planName: true }))
  .use(
    provideServices({
      groceryListServices,
    })
  )
  .mutation(async ({ input, ctx: { authUser, services, repos } }) => {
    // fetch meal plan id
    const mealPlanId = await repos.mealPlanRepository.findByPlanName(
      input.planName,
      authUser.id
    )

    if (!mealPlanId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Not authorized to access this meal plan',
      })
    }

    // fetch planned meals for specific meal plan ->
    const plannedMeals =
      await repos.mealPlanScheduleRepository.findMealsByPlan(mealPlanId)
    if (plannedMeals.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Meal plan does not have planned meals',
      })
    }

    // generate grocery list based on planned meals
    const groceryList =
      await services.groceryListServices.generateGroceryList(plannedMeals)

    // create a map to aggregate quantities by ingredientId
    const ingredientMap = new Map()

    groceryList.forEach((item) => {
      const existingItem = ingredientMap.get(item.ingredientId)
      if (existingItem) {
        // If the ingredient already exists, sum the quantities
        existingItem.quantity += item.quantity
      } else {
        // If not, add the item to the map
        ingredientMap.set(item.ingredientId, {
          ...item,
          mealPlanId,
        })
      }
    })

    // convert the map back to an array
    const formattedData = Array.from(ingredientMap.values())

    // save grocery list to the database
    const savedList = await repos.groceryListRepository.create(formattedData)
    return savedList
  })
