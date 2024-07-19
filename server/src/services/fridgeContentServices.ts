import type { Database } from '@server/database'
import { fridgeContentRepository } from '@server/repositories/fridgeContentRepository'

interface GroceryListItem {
  mealPlanId: number
  ingredientId: number
  quantity: number
}

export function fridgeContentService(db: Database) {
  const frideContentRepo = fridgeContentRepository(db)

  return {
    async placeItemsIntoFridge(
      groceryListItems: GroceryListItem[],
      user: any
    ): Promise<void> {
      await Promise.all(
        groceryListItems.map(async (item) => {
          // check if item already exist in the fridge
          const existingItem = await frideContentRepo.findByUserAndProduct(
            user,
            item.ingredientId
          )

          if (existingItem) {
            await frideContentRepo.updateQuantity(
              existingItem.ingredientId,
              existingItem.existingQuantity + item.quantity
            )
          } else {
            await frideContentRepo.create({
              userId: user,
              mealPlan: item.mealPlanId,
              ingredientId: item.ingredientId,
              existingQuantity: item.quantity,
            })
          }
        })
      )
    },
  }
}
