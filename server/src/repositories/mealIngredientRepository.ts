import type { Database } from '@server/database'
import type { DB, MealIngredient } from '@server/database/types'
import type { Insertable, Selectable, ExpressionBuilder } from 'kysely'
import { jsonObjectFrom } from 'kysely/helpers/postgres'
import {
  type MealIngredientPublic,
  mealIngredientKeysAll,
  mealIngredientKeysPublic,
} from '@server/entities/mealIngredient'

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

    //   async getMealIngredientById(id: number): Promise<Selectable<MealIngredient> | undefined> {
    //     return db
    //       .selectFrom('meal_ingredient')
    //       .select(mealIngredientKeysPublic)
    //       .where('id', '=', id)
    //       .executeTakeFirst();
    //   },

    //   async getIngredientsByMealId(mealId: number): Promise<Selectable<MealIngredient>[]> {
    //     return db
    //       .selectFrom('meal_ingredient')
    //       .select(mealIngredientKeysPublic)
    //       .where('mealId', '=', mealId)
    //       .execute();
    //   },

    //   async updateMealIngredient(id: number, updates: Updateable<MealIngredient>): Promise<void> {
    //     await db
    //       .updateTable('meal_ingredient')
    //       .set(updates)
    //       .where('id', '=', id)
    //       .execute();
    //   },

    //   async deleteMealIngredient(id: number): Promise<void> {
    //     await db
    //       .deleteFrom('meal_ingredient')
    //       .where('id', '=', id)
    //       .execute();
    //   },

    //   async deleteIngredientsByMealId(mealId: number): Promise<void> {
    //     await db
    //       .deleteFrom('meal_ingredient')
    //       .where('mealId', '=', mealId)
    //       .execute();
    //   },

    
  }
}

// function withMealAndIngredient(eb: ExpressionBuilder<DB, "mealIngredient">) {
//   return jsonObjectFrom(
//     eb.selectFrom('meal')
//       .select(['id', 'name'])
//       .whereRef('meal.id', '=', 'mealIngredient.mealId')
//   ).as('meal').combine(
//     jsonObjectFrom(
//       eb.selectFrom('ingredient')
//         .select(['id', 'name'])
//         .whereRef('ingredient.id', '=', 'mealIngredient.ingredientId')
//     ).as('ingredient')
//   ) as AliasedRawBuilder<
//     { meal: { id: number; name: string, calories: number }; ingredient: { id: number; name: string } },
//     'details'
//   >
// }

// function withMealAndIngredient(eb: ExpressionBuilder<DB, "mealIngredient">) {
//   return eb.selectFrom('mealIngredient')
//     .select([
//       jsonObjectFrom(eb.selectFrom('meal').select(['id', 'name', "calories"]).whereRef('meal.id', '=', 'mealIngredient.mealId')).as('meal'),
//       jsonObjectFrom(eb.selectFrom('ingredient').select(['id', 'name']).whereRef('ingredient.id', '=', 'mealIngredient.ingredientId')).as('ingredient')
//     ])
//     .as('details')
// }

export type MealIngredientRepository = ReturnType<
  typeof mealIngredientRepository
>
