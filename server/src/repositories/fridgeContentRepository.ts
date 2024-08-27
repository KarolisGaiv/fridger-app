import type { Database } from '@server/database'
import type { FridgeContent } from '@server/database/types'
import {
  type FridgeContentPublic,
  fridgeContentKeysPublic,
  fridgeContentKeysAll,
} from '@server/entities/fridgeContent'
import { sql, type Insertable } from 'kysely'

export function fridgeContentRepository(db: Database) {
  return {
    async create(
      fridgeContent: Insertable<FridgeContent>
    ): Promise<FridgeContentPublic> {
      return db
        .insertInto('fridgeContent')
        .values(fridgeContent)
        .returning(fridgeContentKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async findByUser(userId: number) {
      const result = await db
        .selectFrom('fridgeContent')
        .innerJoin("ingredient", "ingredient.id", "fridgeContent.ingredientId")
        .where("fridgeContent.userId", '=', userId)
        .select(["ingredient.name", "fridgeContent.existingQuantity", "ingredient.id as ingredientId"])
        .execute()

      return result
    },

    async findByMealPlan(mealPlanId: number): Promise<FridgeContentPublic[]> {
      const result = await db
        .selectFrom('fridgeContent')
        .where('mealPlan', '=', mealPlanId)
        .select(fridgeContentKeysAll)
        .execute()

      return result
    },

    async deleteByUserId(userId: number): Promise<void> {
      await db
        .deleteFrom('fridgeContent')
        .where('userId', '=', userId)
        .execute()
    },

    async findByUserAndProduct(userId: number, ingredientId: number) {
      const [result] = await db
        .selectFrom('fridgeContent')
        .where('userId', '=', userId)
        .where('ingredientId', '=', ingredientId)
        .select(fridgeContentKeysAll)
        .execute()

      return result || null
    },

    async updateQuantity(
      userId: number,
      ingredientId: number,
      quantityChange: number
    ): Promise<void> {
      await db
        .updateTable('fridgeContent')
        .set({
          existingQuantity: sql`${sql.ref('existingQuantity')} + ${quantityChange}`,
        })
        .where('userId', '=', userId)
        .where('ingredientId', '=', ingredientId)
        .executeTakeFirstOrThrow()
    },
  }
}
