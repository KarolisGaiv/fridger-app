import type { Database } from '@server/database'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { GroceryListRepository } from '@server/repositories/groceryListRepository'
import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'
import { TRPCError } from '@trpc/server'

export function groceryListServices(db: Database) {
  const mealPlanRepo = mealPlanRepository(db)
  const mealIngredientRepo = mealIngredientRepository(db)
  // const groceryListRepo = groceryListRepository(db);

  return {
    async generateGroceryList(userId: number) {
      // get user's meal plan
      const mealPlans = await mealPlanRepo.findByUserId(userId)
      if (mealPlans.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No meal plan found for user',
        })
      }
      // find active meal plan
      const activeMealPlan = mealPlans.find((plan) => plan.isActive)
      if (!activeMealPlan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active meal plan found for user',
        })
      }

      // get meal ingredients with their quantities by meal plan ID
      const ingredients = await mealIngredientRepo.findIngredientsByMealPlanId(
        activeMealPlan.id
      )

      return ingredients
    },
  }
}
