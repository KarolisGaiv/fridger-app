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
    async placeItemsIntoFridge(planName: string, userId: number) {
      const activeMealPlanId = await mealPlanRepo.findByPlanName(
        planName,
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

      // Fetch existing fridge contents
      const existingFridgeContents = await fridgeContentRepo.findByUser(userId)

      // Create a map of existing fridge items for quick lookup
      const fridgeMap = new Map(
        existingFridgeContents.map((item) => [item.ingredientId, item])
      )

      // List to hold items that need to be updated or added
      const itemsToUpdateOrAdd: {
        ingredientId: number
        updatedQuantity: number
      }[] = []

      groceryList.forEach((item) => {
        const existingItem = fridgeMap.get(item.ingredientId)

        if (existingItem) {
          // Calculate how much more of the item is needed to reach the total required quantity
          const totalNeededQuantity = item.quantity
          const currentQuantity = existingItem.existingQuantity ?? 0
          const neededQuantity = totalNeededQuantity - currentQuantity

          if (neededQuantity > 0) {
            itemsToUpdateOrAdd.push({
              ingredientId: item.ingredientId,
              updatedQuantity: neededQuantity, //  add needed quantity to reach required amount
            })
          }
        } else {
          // If the item does not exist, add the entire required quantity
          itemsToUpdateOrAdd.push({
            ingredientId: item.ingredientId,
            updatedQuantity: item.quantity,
          })
        }
      })

      // Update or create only the necessary items
      await Promise.all(
        itemsToUpdateOrAdd.map(async ({ ingredientId, updatedQuantity }) => {
          const existingItem = fridgeMap.get(ingredientId)

          if (existingItem) {
            await fridgeContentRepo.updateQuantity(
              userId,
              ingredientId,
              updatedQuantity
            )
          } else {
            await fridgeContentRepo.create({
              userId,
              mealPlan: activeMealPlanId,
              ingredientId,
              existingQuantity: updatedQuantity,
            })
          }
        })
      )

      const updatedFridgeContent = await fridgeContentRepo.findByUser(userId)
      return updatedFridgeContent
    },
  }
}
