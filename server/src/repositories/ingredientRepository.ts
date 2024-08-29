import type { Database } from '@server/database'
import type { Ingredient } from '@server/database/types'
import {
  type IngredientPublic,
  ingredientKeys,
  ingredientKeyPublic,
} from '@server/entities/ingredient'
import type { Insertable, Selectable } from 'kysely'

export function ingredientRepository(db: Database) {
  return {
    async create(name: Insertable<Ingredient>): Promise<IngredientPublic> {
      return db
        .insertInto('ingredient')
        .values(name)
        .returning(ingredientKeyPublic)
        .executeTakeFirstOrThrow()
    },

    async findByName(
      name: string,
      userId: number
    ): Promise<Selectable<Ingredient> | undefined> {
      const ingredient = await db
        .selectFrom('ingredient')
        .select(ingredientKeys)
        .where('user', '=', userId)
        .where('name', '=', name)
        .executeTakeFirst()

      return ingredient
    },

    async findByIngredientId(ingredientId: number, userId: number) {
      return db
        .selectFrom('ingredient')
        .select(ingredientKeyPublic)
        .where('user', '=', userId)
        .where('id', '=', ingredientId)
        .executeTakeFirst()
    },

    async findAll(userId: number): Promise<IngredientPublic[]> {
      return db
        .selectFrom('ingredient')
        .select(ingredientKeys)
        .where('user', '=', userId)
        .orderBy('id', 'asc')
        .execute()
    },

    async updateIngredient(
      ingredientName: string,
      userId: number,
      updates: Partial<Insertable<IngredientPublic>>
    ): Promise<IngredientPublic | undefined> {
      const result = await db
        .updateTable('ingredient')
        .set(updates)
        .where('user', '=', userId)
        .where('name', '=', ingredientName)
        .returning(ingredientKeyPublic)
        .executeTakeFirst()

      return result
    },

    async deleteIngredient(name: string, userId: number): Promise<void> {
      await db
        .deleteFrom('ingredient')
        .where('user', '=', userId)
        .where('name', '=', name)
        .execute()
    },

    async createMultipleIngredients(
      ingredients: { name: string; user: number }[]
    ) {
      return db
        .insertInto('ingredient')
        .values(ingredients)
        .returning(ingredientKeys)
        .execute()
    },
  }
}

/**
 * Represents a repository object for managing ingredients in the database.
 * This type includes methods to interact with ingredient data in the database.
 * @typedef {Object} IngredientRepository
 * @property {Function} create - Method to add a new ingredient to the database.
 * @property {Function} findByName - Method to find an ingredient by name in the database.
 * @property {Function} findAll - Method to retrieve all ingredients from the database.
 * @property {Function} updateIngredient - Method to update an ingredient in the database.
 * @property {Function} deleteIngredient - Method to delete an ingredient from the database.
 * @returns {Promise<IngredientPublic>} A promise that, when resolved, returns information about an ingredient.
 */
export type IngredientRepository = ReturnType<typeof ingredientRepository>
