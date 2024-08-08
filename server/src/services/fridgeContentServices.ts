import type { Database } from '@server/database'
import { fridgeContentRepository } from '@server/repositories/fridgeContentRepository'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { groceryListRepository } from '@server/repositories/groceryListRepository'
import { TRPCError } from '@trpc/server'

export function fridgeContentService(db: Database) {
  const fridgeContentRepo = fridgeContentRepository(db)
  const mealPlanRepo = mealPlanRepository(db)
  const groceryListRepo = groceryListRepository(db)

  return {
    async placeItemsIntoFridge(userId: number): Promise<void> {
      // Find active meal plan for user
      const activeMealPlan = await mealPlanRepo.findActiveMealPlan(userId)

      if (!activeMealPlan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User has no active meal plan',
        })
      }

      // Find grocery list by the active meal plan
      const groceryList = await groceryListRepo.findByMealPlanId(
        activeMealPlan.id
      )

      if (!groceryList || groceryList.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Please generate grocery list for the meal plan',
        })
      }

      // Place items into fridge
      await Promise.all(
        groceryList.map(async (item) => {
          const existingItem = await fridgeContentRepo.findByUserAndProduct(
            userId,
            item.ingredientId
          )

          if (existingItem) {
            // Handle the case where existingQuantity might be null
            const updatedQuantity = existingItem.existingQuantity ?? 0
            await fridgeContentRepo.updateQuantity(
              existingItem.ingredientId,
              updatedQuantity + item.quantity
            )
          } else {
            await fridgeContentRepo.create({
              userId,
              mealPlan: activeMealPlan.id,
              ingredientId: item.ingredientId,
              existingQuantity: item.quantity,
            })
          }
        })
      )
    },
  }
}
