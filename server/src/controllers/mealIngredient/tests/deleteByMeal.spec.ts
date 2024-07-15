import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll } from '@tests/utils/records'
import { fakeMeal, fakeIngredient } from '@server/entities/tests/fakes'
import mealIngredientRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealIngredientRouter)
const { deleteIngredientsByMealId } = createCaller({ db })

beforeEach(async () => {
  await clearTables(db, ['mealIngredient', 'meal', 'ingredient'])
})

afterEach(async () => {
  await clearTables(db, ['mealIngredient', 'meal', 'ingredient'])
})

it('should delete ingredients by meal ID', async () => {
  const [meal1] = await insertAll(db, 'meal', [fakeMeal()])
  const [ingredient1, ingredient2] = await insertAll(db, 'ingredient', [
    fakeIngredient(),
    fakeIngredient(),
  ])

  await insertAll(db, 'mealIngredient', [
    { mealId: meal1.id, ingredientId: ingredient1.id, quantity: 200 },
    { mealId: meal1.id, ingredientId: ingredient2.id, quantity: 300 },
  ])

  await deleteIngredientsByMealId({ mealId: meal1.id })

  const remainingIngredients = await db
    .selectFrom('mealIngredient')
    .where('mealId', '=', meal1.id)
    .execute()

  expect(remainingIngredients).toHaveLength(0)
})

it('should do nothing if no ingredients are found for the meal ID', async () => {
  const [meal1] = await insertAll(db, 'meal', [fakeMeal()])

  await deleteIngredientsByMealId({ mealId: meal1.id }) // Attempting to delete, but no ingredients exist

  const remainingIngredients = await db
    .selectFrom('mealIngredient')
    .where('mealId', '=', meal1.id)
    .execute()

  expect(remainingIngredients).toHaveLength(0)
})
