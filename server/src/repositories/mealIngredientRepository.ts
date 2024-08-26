import type { Database } from '@server/database'
import type { MealIngredient } from '@server/database/types'
import type { Insertable, Selectable } from 'kysely'
import {
  type MealIngredientPublic,
  mealIngredientKeysPublic,
} from '@server/entities/mealIngredient'

export interface MealIngredientWithMealName
  extends Selectable<MealIngredientPublic> {
  ingredientName: string
}

export function mealIngredientRepository(db: Database) {
  return {
    async create(
      mealIngredient: Insertable<MealIngredient>
    ): Promise<MealIngredientPublic> {
      return db
        .insertInto('mealIngredient')
        .values(mealIngredient)
        .returning(mealIngredientKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async findMealIngredientById(
      id: number
    ): Promise<Selectable<MealIngredientPublic> | undefined> {
      return db
        .selectFrom('mealIngredient')
        .select(mealIngredientKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst()
    },

    async findIngredientsByMealId(
      mealId: number
    ): Promise<Selectable<MealIngredientPublic>[]> {
      return db
        .selectFrom('mealIngredient')
        .select(mealIngredientKeysPublic)
        .where('mealId', '=', mealId)
        .execute()
    },

    async findIngredientsByMealPlanId(
      mealPlanId: number
    ): Promise<Selectable<MealIngredientWithMealName>[]> {
      return db
        .selectFrom('mealIngredient')
        .innerJoin('meal', 'meal.id', 'mealIngredient.mealId')
        .innerJoin('ingredient', 'ingredient.id', 'mealIngredient.ingredientId')
        .where('mealIngredient.mealPlan', '=', mealPlanId)
        .select([
          'mealIngredient.ingredientId',
          'mealIngredient.quantity',
          'mealIngredient.mealId',
          'ingredient.name as ingredientName',
        ])
        .execute()
    },

    async updateMealIngredient(
      mealIngredientId: number,
      updates: Partial<Insertable<MealIngredient>>
    ): Promise<MealIngredientPublic | undefined> {
      const result = await db
        .updateTable('mealIngredient')
        .set(updates)
        .where('id', '=', mealIngredientId)
        .returning(mealIngredientKeysPublic)
        .executeTakeFirst()

      return result
    },

    async deleteMealIngredient(id: number): Promise<void> {
      await db.deleteFrom('mealIngredient').where('id', '=', id).execute()
    },

    async deleteIngredientsByMealId(mealId: number): Promise<void> {
      await db
        .deleteFrom('mealIngredient')
        .where('mealId', '=', mealId)
        .execute()
    },

    async findByMealIds(
      mealIds: { mealId: number }[]
    ): Promise<Selectable<MealIngredientWithMealName>[]> {
      // Extract unique mealIds from the input array
      const uniqueMealIds = [...new Set(mealIds.map(item => item.mealId))];
    
      // Query the database for ingredients related to the unique mealIds
      return db
        .selectFrom('mealIngredient')
        .innerJoin('ingredient', 'ingredient.id', 'mealIngredient.ingredientId')
        .where('mealIngredient.mealId', 'in', uniqueMealIds)
        .select([
          'mealIngredient.ingredientId',
          'ingredient.name as ingredientName',
          'mealIngredient.quantity',
          'mealIngredient.mealId',
        ])
        .execute();
    }
  }
}

export type MealIngredientRepository = ReturnType<
  typeof mealIngredientRepository
>
