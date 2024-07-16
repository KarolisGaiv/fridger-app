import type { Database } from '@server/database'
import type { MealPlan } from '@server/database/types'
import {
  type MealPlanPublic,
  mealPlanKeysAll,
  mealPlanKeysPublic,
} from '@server/entities/mealPlan'
import type { Insertable, Selectable } from 'kysely'
import { MealPlanPublic } from '../entities/mealPlan'

export function mealPlanRepository(db: Database) {
  return {
    async create(mealPlan: Insertable<MealPlan>): Promise<MealPlanPublic> {
      return db
        .insertInto('mealPlan')
        .values(mealPlan)
        .returning(mealPlanKeysPublic)
        .executeTakeFirstOrThrow()
    },
  }
}

export type MealPlanRepository = ReturnType<typeof mealPlanRepository>
