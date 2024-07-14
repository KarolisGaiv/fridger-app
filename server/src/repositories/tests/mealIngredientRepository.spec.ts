import { createTestDatabase } from '@tests/utils/database'
import {
  fakeMeal,
  fakeIngredient,
  fakeMealIngredient,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { mealIngredientRepository } from '../mealIngredientRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = mealIngredientRepository(db)

describe('create', () => {
  it('should create a new meal ingredient', async () => {
    await clearTables(db, ['mealIngredient', 'meal', 'ingredient'])
    const [meal1] = await insertAll(db, 'meal', [fakeMeal()])
    const [ingredient1] = await insertAll(db, 'ingredient', [fakeIngredient()])

    const fakeIngr = {
      quantity: 350,
      mealId: meal1.id,
      ingredientId: ingredient1.id,
    }

    const createdIngr = await repository.create(fakeIngr)

    expect(createdIngr).toEqual({
      ingredientId: fakeIngr.ingredientId,
      mealId: fakeIngr.mealId,
      quantity: fakeIngr.quantity,
    })
  })
})

describe('find meal ingredient funcionalities', () => {
  describe('findMealIngredientById', () => {
    it("should find meal ingredient by it's ID", async () => {
      const [meal1] = await insertAll(db, 'meal', [fakeMeal()])
      const [ingredient1] = await insertAll(db, 'ingredient', [
        fakeIngredient(),
      ])

      const [fakeIngr] = await insertAll(db, 'mealIngredient', {
        quantity: 350,
        mealId: meal1.id,
        ingredientId: ingredient1.id,
      })

      const res = await repository.findMealIngredientById(fakeIngr.id)
      expect(res).toMatchObject({
        mealId: meal1.id,
        ingredientId: ingredient1.id,
      })
    })

    it('return nothing if meal ingredient does not exist', async () => {
      const res = await repository.findMealIngredientById(999)
      expect(res).toBeUndefined()
    })
  })
})
