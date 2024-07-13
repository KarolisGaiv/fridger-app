import type { Database } from '@server/database'
import type { Meal } from '@server/database/types'
import {
  type MealPublic,
  mealKeysAll,
  mealKeysPublic,
} from '@server/entities/meal'
import type { Insertable, Selectable } from 'kysely'

export function mealRepository(db: Database) {
  return {
    async create(meal: Insertable<Meal>): Promise<MealPublic> {
      return db
        .insertInto('meal')
        .values(meal)
        .returning(mealKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async findByName(name: string): Promise<Selectable<Meal> | undefined> {
      const meal = await db
        .selectFrom('meal')
        .select(mealKeysAll)
        .where('name', '=', name)
        .executeTakeFirst()

      return meal
    },

    async findAll(): Promise<MealPublic[]> {
      return db
        .selectFrom('meal')
        .select(mealKeysAll)
        .orderBy('id', 'asc')
        .execute()
    },

    async updateMeal(
      mealName: string,
      updates: Partial<Insertable<MealPublic>>
    ): Promise<MealPublic | undefined> {
      const result = await db
        .updateTable('meal')
        .set(updates)
        .where('name', '=', mealName)
        .returning(mealKeysPublic)
        .executeTakeFirst()

      return result
    },

    async delete(name: string): Promise<void> {
      await db.deleteFrom('meal').where('name', '=', name).execute()
    },
  }
}

/**
 * Represents the type of an object returned by the mealRepository function.
 * This type includes methods like 'create' to interact with meal data.
 * @typedef {Object} MealRepository
 * @property {Function} create - Method to add a new meal to the database.
 * @returns {Promise<MealPublic>} A promise that, when resolved, gives back a meal's information.
 */
export type MealRepository = ReturnType<typeof mealRepository>
