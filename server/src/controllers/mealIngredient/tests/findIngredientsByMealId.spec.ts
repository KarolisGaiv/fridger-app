import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { fakeMeal, fakeIngredient } from '@server/entities/tests/fakes'
import mealIngredientRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealIngredientRouter)
const { findIngredientsByMealId } = createCaller({ db })

beforeAll(async () => {
  await clearTables(db, ['mealIngredient', 'meal', 'ingredient'])
})

afterEach(async () => {
  await clearTables(db, ['mealIngredient', 'meal', 'ingredient'])
})

describe('findIngredientsByMealId', () => {
  it('should find ingredients by meal ID', async () => {
    const [meal1] = await insertAll(db, 'meal', [fakeMeal()])
    const [ingredient1, ingredient2] = await insertAll(db, 'ingredient', [
      fakeIngredient(),
      fakeIngredient(),
    ])

    await insertAll(db, 'mealIngredient', [
      { mealId: meal1.id, ingredientId: ingredient1.id, quantity: 200 },
      { mealId: meal1.id, ingredientId: ingredient2.id, quantity: 300 },
    ])

    const result = await findIngredientsByMealId({ mealId: meal1.id })

    expect(result).toHaveLength(2)
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          mealId: meal1.id,
          ingredientId: ingredient1.id,
          quantity: 200,
        }),
        expect.objectContaining({
          mealId: meal1.id,
          ingredientId: ingredient2.id,
          quantity: 300,
        }),
      ])
    )
  })

  it('should return an empty array if no ingredients are found for the meal', async () => {
    const [meal1] = await insertAll(db, 'meal', [fakeMeal()])

    const result = await findIngredientsByMealId({ mealId: meal1.id })

    expect(result).toHaveLength(0)
  })

  it('should throw a NOT_FOUND error if the meal does not exist', async () => {
    await expect(findIngredientsByMealId({ mealId: 999 })).rejects.toThrowError(
      /meal does not exist/i
    )
  })
})
