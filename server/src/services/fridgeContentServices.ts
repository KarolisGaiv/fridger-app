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
    async placeItemsIntoFridge(userId: number) {
      // Find active meal plan for user
      const activeMealPlanName = await mealPlanRepo.findActiveMealPlan(userId)

      if (!activeMealPlanName) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User has no active meal plan',
        })
      }

      const activeMealPlanId = await mealPlanRepo.findByPlanName(
        activeMealPlanName,
        userId
      )

      if (activeMealPlanId === undefined) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Error: No meal plan ID found for the active meal plan',
        })
      }

      // Find grocery list by the active meal plan
      const groceryList =
        await groceryListRepo.findByMealPlanId(activeMealPlanId)

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
              mealPlan: activeMealPlanId,
              ingredientId: item.ingredientId,
              existingQuantity: item.quantity,
            })
          }
        })
      )

      const updatedFridgeContent = await fridgeContentRepo.findByUser(userId)
      return updatedFridgeContent
    },
  }
}
