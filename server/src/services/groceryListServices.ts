import type { Database } from '@server/database'
import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'
import { TRPCError } from '@trpc/server'

export function groceryListServices(db: Database) {
  const mealIngredientRepo = mealIngredientRepository(db)

  return {
    async generateGroceryList(plannedMeals: { mealId: number }[]) {
      const ingredients = await mealIngredientRepo.findByMealIds(plannedMeals)

      if (ingredients.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No meal ingredients found for this meal plan',
        })
      }

      // transform ingredients into grocery list format
      const groceryListItems = ingredients.map((ingredient) => ({
        product: ingredient.ingredientName,
        quantity: ingredient.quantity,
        ingredientId: ingredient.ingredientId,
      }))

      return groceryListItems
    },
  }
}
