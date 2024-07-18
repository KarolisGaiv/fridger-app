import type { Database } from '@server/database'
import type { MealPlan } from '@server/database/types'
import {
  type MealPlanPublic,
  mealPlanKeysAll,
  mealPlanKeysPublic,
} from '@server/entities/mealPlan'
import type { Insertable, Selectable } from 'kysely'

export function mealPlanRepository(db: Database) {
  return {
    async create(mealPlan: Insertable<MealPlan>): Promise<MealPlanPublic> {
      return db
        .insertInto('mealPlan')
        .values(mealPlan)
        .returning(mealPlanKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async findById(id: number): Promise<Selectable<MealPlan> | undefined> {
      return db
        .selectFrom('mealPlan')
        .select(mealPlanKeysAll)
        .where('id', '=', id)
        .executeTakeFirst()
    },

    async findByUserId(userId: number): Promise<Selectable<MealPlan>[]> {
      return db
        .selectFrom('mealPlan')
        .select(mealPlanKeysAll)
        .where('userId', '=', userId)
        .execute()
    },

    async update(
      id: number,
      updates: Partial<Insertable<MealPlan>>
    ): Promise<MealPlanPublic | undefined> {
      const result = await db
        .updateTable('mealPlan')
        .set(updates)
        .where('id', '=', id)
        .returning(mealPlanKeysPublic)
        .executeTakeFirst()
      return result
    },

    async deleteById(id: number): Promise<void> {
      await db.deleteFrom('mealPlan').where('id', '=', id).execute()
    },
  }
}

export type MealPlanRepository = ReturnType<typeof mealPlanRepository>
