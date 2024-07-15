import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { fakeMeal, fakeIngredient } from '@server/entities/tests/fakes'
import mealIngredientRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealIngredientRouter)
const { updateMealIngredient } = createCaller({ db })

beforeEach(async () => {
  await clearTables(db, ['meal', 'ingredient', 'mealIngredient'])
})

afterEach(async () => {
  await clearTables(db, ['meal', 'ingredient', 'mealIngredient'])
})

it('should update a meal ingredient successfully', async () => {
  const [meal1] = await insertAll(db, 'meal', [fakeMeal()])
  const [ingredient1] = await insertAll(db, 'ingredient', [fakeIngredient()])

  const initialMealIngredient = {
    mealId: meal1.id,
    ingredientId: ingredient1.id,
    quantity: 200,
  }

  const updatedInfo = {
    quantity: 300,
  }

  const [insertedMealIngredient] = await insertAll(db, 'mealIngredient', [
    initialMealIngredient,
  ])

  const result = await updateMealIngredient({
    mealIngredientId: insertedMealIngredient.id,
    updateInfo: updatedInfo,
  })

  expect(result).toMatchObject({
    mealId: meal1.id,
    ingredientId: ingredient1.id,
    quantity: updatedInfo.quantity,
  })
})

it('should throw a NOT_FOUND error if the meal ingredient does not exist', async () => {
  const updatedInfo = {
    quantity: 300,
  }

  await expect(
    updateMealIngredient({
      mealIngredientId: 999, // Assuming a non-existent ID
      updateInfo: updatedInfo,
    })
  ).rejects.toThrowError(/meal ingredient does not exist/i)
})
