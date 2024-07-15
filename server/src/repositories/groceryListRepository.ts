import type { Database } from '@server/database'
import type { GroceryList } from '@server/database/types'

import {
  type GroceryListPublic,
  groceryListKeysPublic,
  groceryListKeysAll,
} from '@server/entities/groceryList'
import type { Insertable, Selectable } from 'kysely'

export function groceryListRepository(db: Database) {
  return {
    async create(
      groceryList: Insertable<GroceryList>
    ): Promise<GroceryListPublic> {
      return db
        .insertInto('groceryList')
        .values(groceryList)
        .returning(groceryListKeysPublic)
        .executeTakeFirstOrThrow()
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
