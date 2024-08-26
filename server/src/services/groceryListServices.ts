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

      // Create a map to aggregate quantities by ingredientId
      const ingredientMap = new Map<
        number,
        { product: string; quantity: number; ingredientId: number }
      >()

      // Aggregate quantities
      plannedMeals.forEach(({ mealId }) => {
        const mealIngredients = ingredients.filter(
          (ingredient) => ingredient.mealId === mealId
        )

        mealIngredients.forEach(
          ({ ingredientId, ingredientName, quantity }) => {
            const existingItem = ingredientMap.get(ingredientId)
            if (existingItem) {
              existingItem.quantity += quantity
            } else {
              ingredientMap.set(ingredientId, {
                product: ingredientName,
                quantity,
                ingredientId,
              })
            }
          }
        )
      })

      // Convert the map back to an array
      const groceryListItems = Array.from(ingredientMap.values())

      return groceryListItems
    },
  }
}
