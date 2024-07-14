import { createTestDatabase } from '@tests/utils/database'
import { fakeIngredient } from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll, clearTables } from '@tests/utils/records'
import { ingredientRepository } from '../ingredientRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = ingredientRepository(db)

describe('create', () => {
  it('should create a new ingredient', async () => {
    const ingredient = fakeIngredient()
    const createdIngredient = await repository.create(ingredient)

    expect(createdIngredient).toEqual({
      name: ingredient.name,
      id: ingredient.id,
    })
  })
})
