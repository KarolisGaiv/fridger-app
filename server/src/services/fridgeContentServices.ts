import type { Database } from '@server/database'
import { fridgeContentRepository } from '@server/repositories/fridgeContentRepository'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { groceryListRepository } from '@server/repositories/groceryListRepository'
import { TRPCError } from '@trpc/server'

export function fridgeContentService(db: Database) {
  const frideContentRepo = fridgeContentRepository(db)
  const mealPlanRepo = mealPlanRepository(db)
  const groceryListRepo = groceryListRepository(db)

  return {
    async placeItemsIntoFridge(userId: number): Promise<void> {
      // find active meal plan for user
      const activeMealPlan = await mealPlanRepo.findActiveMealPlan(userId)

      if (!activeMealPlan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User has no active meal plan',
        })
      }

      // find grocery list by the active meal plan
      const groceryList = await groceryListRepo.findByMealPlanId(
        activeMealPlan.id
      )

      if (!groceryList || groceryList.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Please generate grocery list for the meal plan',
        })
      }

      // place items into fridge
      await Promise.all(
        groceryList.map(async (item) => {
          const existingItem = await frideContentRepo.findByUserAndProduct(
            userId,
            item.ingredientId
          )

          if (existingItem) {
            await frideContentRepo.updateQuantity(
              existingItem.ingredientId,
              existingItem.existingQuantity + item.quantity
            )
          } else {
            await frideContentRepo.create({
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
