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
        .selectFrom("meal")
        .select(mealKeysAll)
        .where("name", "=", name)
        .executeTakeFirst()

        return meal
    },

    async findAll(): Promise<MealPublic[]> {
      return db
        .selectFrom("meal")
        .select(mealKeysAll)
        .orderBy("id", "asc")
        .execute()
    }
  }
}

/**
 * Represents the type of an object returned by the mealRepository function.
 * This type includes methods like 'create' to interact with meal data.
 * @typedef {Object} UserRepository
 * @property {Function} create - Method to add a new meal to the database.
 * @returns {Promise<UserPublic>} A promise that, when resolved, gives back a meal's information.
 */
export type MealRepository = ReturnType<typeof mealRepository>
