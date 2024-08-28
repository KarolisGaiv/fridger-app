import type { Database } from '@server/database'
import type { Meal } from '@server/database/types'
import {
  type MealPublic,
  type UpdateMealType,
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

    async findByName(
      name: string,
      userId: number
    ): Promise<Selectable<Meal> | undefined> {
      const meal = await db
        .selectFrom('meal')
        .select(mealKeysAll)
        .where('user', '=', userId)
        .where('name', '=', name)
        .executeTakeFirst()

      return meal
    },

    async findById(id: number): Promise<Selectable<Meal> | undefined> {
      const meal = await db
        .selectFrom('meal')
        .select(mealKeysAll)
        .where('id', '=', id)
        .executeTakeFirst()

      return meal
    },

    async findAll(userId: number): Promise<{ name: string }[]> {
      const data = await db
        .selectFrom('meal')
        .select('name')
        .where('user', '=', userId)
        .execute()

      return data
    },

    async updateMeal(
      userId: number,
      mealName: string,
      updates: Partial<UpdateMealType>
    ): Promise<MealPublic | undefined> {
      const result = await db
        .updateTable('meal')
        .set(updates)
        .where('user', '=', userId)
        .where('name', '=', mealName)
        .returning(mealKeysPublic)
        .executeTakeFirst()

      return result
    },

    async deleteMeal(name: string, userId: number): Promise<void> {
      await db
        .deleteFrom('meal')
        .where('user', '=', userId)
        .where('name', '=', name)
        .execute()
    },

    async findByMealPlanID(planID: number, userId: number) {
      return db
        .selectFrom('meal')
        .select(mealKeysPublic)
        .where('user', '=', userId)
        .where('mealPlan', '=', planID)
        .execute()
    },

    async toggleCompletionStatus(
      mealName: string,
      userId: number
    ): Promise<void> {
      const currentStatus = await db
        .selectFrom('meal')
        .innerJoin('mealPlan', 'meal.mealPlan', 'mealPlan.id')
        .select(['meal.completed', 'meal.id'])
        .where('meal.user', '=', userId)
        .where('meal.name', '=', mealName)
        .where('mealPlan.isActive', '=', true)
        .executeTakeFirst()

      if (!currentStatus || currentStatus.id === undefined) {
        throw new Error('Meal not found or not part of an active meal plan')
      }

      const newStatus = !currentStatus.completed

      await db
        .updateTable('meal')
        .set({ completed: newStatus })
        .where('user', '=', userId)
        .where('name', '=', mealName)
        .where('id', '=', currentStatus.id)
        .execute()
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
