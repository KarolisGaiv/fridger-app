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

    async findByName(name: string): Promise<Selectable<Ingredient> | undefined> {
        const ingredient = await db
          .selectFrom("ingredient")
          .select(ingredientKeys)
          .where('name', '=', name)
          .executeTakeFirst()
  
        return ingredient
      },
  }
}
