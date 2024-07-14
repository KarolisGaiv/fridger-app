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

    async deleteMeal(name: string): Promise<void> {
      await db.deleteFrom('meal').where('name', '=', name).execute()
    },
  }
}

/**
 * Represents the type of an object returned by the mealRepository function.
 * This type includes methods like 'create' to interact with meal data.
 * @typedef {Object} MealRepository
 * @property {Function} create - Method to add a new meal to the database.
 * @property {Function} findByName - Method to find meal in the database.
 * @property {Function} findAll - Method to find all meals in the database.
 * @property {Function} updateMeal - Method to update a meal in the database.
 * @property {Function} deleteMeal - Method to delete a new meal 
 * @returns {Promise<MealPublic>} A promise that, when resolved, gives back a meal's information.
 */
export type MealRepository = ReturnType<typeof mealRepository>
