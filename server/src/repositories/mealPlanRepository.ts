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
      const newMealPlan = await db
        .insertInto('mealPlan')
        .values(mealPlan)
        .returning(mealPlanKeysAll)
        .executeTakeFirstOrThrow()

      // Ensure only one meal plan is active per user
      if (mealPlan.isActive) {
        await db
          .updateTable('mealPlan')
          .set({ isActive: false }) // deactivate other meal plans
          .where('userId', '=', mealPlan.userId)
          .where('id', '!=', newMealPlan.id)
          .where('isActive', '=', true)
          .execute()
      }

      return newMealPlan
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

    async findByPlanName(
      planName: string,
      userId: number
    ): Promise<number | undefined> {
      const res = await db
        .selectFrom('mealPlan')
        .select('id')
        .where('userId', '=', userId)
        .where('planName', '=', planName)
        .executeTakeFirst()

      return res?.id
    },

    async findActiveMealPlan(userId: number): Promise<string | undefined> {
      const res = await db
        .selectFrom('mealPlan')
        .select('planName')
        .where('userId', '=', userId)
        .where('isActive', '=', true)
        .executeTakeFirst()

      return res?.planName
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
