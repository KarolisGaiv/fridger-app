import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll } from '@tests/utils/records'
import { fakeMeal, fakeIngredient } from '@server/entities/tests/fakes'
import mealIngredientRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealIngredientRouter)
const { deleteById } = createCaller({ db })

beforeEach(async () => {
  await clearTables(db, ['mealIngredient', 'meal', 'ingredient'])
})

afterEach(async () => {
  await clearTables(db, ['mealIngredient', 'meal', 'ingredient'])
})

describe('deleteById', () => {
  it('should delete a meal ingredient successfully', async () => {
    const [meal1] = await insertAll(db, 'meal', [fakeMeal()])
    const [ingredient1] = await insertAll(db, 'ingredient', [fakeIngredient()])

    const [mealIngredient] = await insertAll(db, 'mealIngredient', [
      {
        mealId: meal1.id,
        ingredientId: ingredient1.id,
        quantity: 200,
      },
    ])

    await deleteById({ id: mealIngredient.id })

    const remainingMealIngredients = await db
      .selectFrom('mealIngredient')
      .where('id', '=', mealIngredient.id)
      .execute()

    expect(remainingMealIngredients).toHaveLength(0)
  })

  it('should handle non-existent ID gracefully', async () => {
    // Call deleteById with an ID that doesn't exist in the database
    const result = await deleteById({ id: 999 })

    expect(result).toBeUndefined()
  })
})
