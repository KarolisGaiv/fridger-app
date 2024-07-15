import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import { fakeMeal, fakeIngredient } from '@server/entities/tests/fakes'
import mealIngredientRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealIngredientRouter)
const { create } = createCaller({ db })

describe('create', async () => {
  const [meal] = await insertAll(db, 'meal', [fakeMeal()])
  const [ingredient] = await insertAll(db, 'ingredient', [fakeIngredient()])
  it('should create and save a new meal ingredient', async () => {
    const mealIngredientData = {
      mealId: meal.id,
      ingredientId: ingredient.id,
      quantity: 200,
    }

    const createdMealIngredient = await create(mealIngredientData)

    expect(createdMealIngredient).toMatchObject(mealIngredientData)

    const mealIngredients = await selectAll(db, 'mealIngredient')
    expect(mealIngredients).toHaveLength(1)
    expect(mealIngredients[0]).toMatchObject(mealIngredientData)
  })
})
