import type { Database } from '@server/database'
import type { Ingredient } from '@server/database/types'
import Selectable from 'kysely'
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
  }
}
