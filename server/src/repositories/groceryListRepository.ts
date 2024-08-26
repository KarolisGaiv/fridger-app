import type { Database } from '@server/database'
import type { GroceryList } from '@server/database/types'

import {
  type GroceryListPublic,
  groceryListKeysPublic,
  groceryListKeysAll,
} from '@server/entities/groceryList'
import { type Insertable, type Selectable } from 'kysely'

export function groceryListRepository(db: Database) {
  return {
    async create(
      groceryList: Omit<GroceryList, 'id'>[]
    ): Promise<GroceryListPublic[]> {
      const result = await Promise.all(
        groceryList.map(async (item) => {
          // Check if the item already exists
          const existingItem = await db
            .selectFrom('groceryList')
            .selectAll()
            .where('mealPlanId', '=', item.mealPlanId)
            .where('ingredientId', '=', item.ingredientId)
            .executeTakeFirst()

          if (existingItem) {
            // If it exists, update the quantity
            return db
              .updateTable('groceryList')
              .set({ quantity: item.quantity })
              .where('id', '=', existingItem.id)
              .returning(groceryListKeysPublic)
              .executeTakeFirst()
          }

          // If it doesn't exist, insert a new item
          return db
            .insertInto('groceryList')
            .values(item)
            .returning(groceryListKeysPublic)
            .executeTakeFirst()
        })
      )

      // Filter out any undefined values to match the expected type
      return result.filter(
        (item): item is GroceryListPublic => item !== undefined
      )
    },

    async findById(id: number): Promise<Selectable<GroceryList> | undefined> {
      return db
        .selectFrom('groceryList')
        .select(groceryListKeysAll)
        .where('id', '=', id)
        .executeTakeFirst()
    },

    async findByMealPlanId(
      mealPlanId: number
    ): Promise<Selectable<GroceryList>[]> {
      return db
        .selectFrom('groceryList')
        .select(groceryListKeysAll)
        .where('mealPlanId', '=', mealPlanId)
        .execute()
    },

    async update(
      groceryListId: number,
      updates: Partial<Insertable<GroceryList>>
    ): Promise<GroceryListPublic | undefined> {
      const result = await db
        .updateTable('groceryList')
        .set(updates)
        .where('id', '=', groceryListId)
        .returning(groceryListKeysPublic)
        .executeTakeFirst()

      return result
    },

    async deleteById(id: number): Promise<void> {
      await db.deleteFrom('groceryList').where('id', '=', id).execute()
    },
  }
}

export type GroceryListRepository = ReturnType<typeof groceryListRepository>
