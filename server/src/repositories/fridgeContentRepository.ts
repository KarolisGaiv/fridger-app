import type { Database } from '@server/database'
import type { FridgeContent } from '@server/database/types'
import {
  type FridgeContentPublic,
  fridgeContentKeysPublic,
  fridgeContentKeysAll,
} from '@server/entities/fridgeContent'
import type { Insertable } from 'kysely'

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

    async findByUser(userId: number): Promise<FridgeContentPublic[]> {
      const result = await db
        .selectFrom('fridgeContent')
        .where('userId', '=', userId)
        .select(fridgeContentKeysAll)
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
  }
}
