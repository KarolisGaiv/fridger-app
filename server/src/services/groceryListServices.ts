import type { Database, GroceryList } from '@server/database'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'
import { TRPCError } from '@trpc/server'
import type { Insertable } from 'kysely'

export function groceryListServices(db: Database) {
  const mealPlanRepo = mealPlanRepository(db)
  const mealIngredientRepo = mealIngredientRepository(db)

  return {
    async generateGroceryList(userId: number) {
      // get user's meal plans
      const mealPlans = await mealPlanRepo.findByUserId(userId)
      if (mealPlans.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No meal plan found for user',
        })
      }
      // find active meal plan
      // const activeMealPlan = mealPlans.find((plan) => plan.isActive)
      const activeMealPlan = await mealPlanRepo.findActiveMealPlan(userId)
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

      if (ingredients.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No meal ingredients found for this meal plan',
        })
      }

      // transform ingredients into grocery list format
      const groceryListItems: Insertable<GroceryList>[] = ingredients.map(
        (ingredient) => ({
          mealPlanId: activeMealPlan.id,
          product: ingredient.ingredientName,
          quantity: ingredient.quantity,
          ingredientId: ingredient.ingredientId,
        })
      )

      return groceryListItems
    },
  }
}
