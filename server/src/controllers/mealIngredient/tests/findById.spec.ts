import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { fakeMeal, fakeIngredient } from '@server/entities/tests/fakes'
import mealIngredientRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealIngredientRouter)
const { findById } = createCaller({ db })

beforeAll(async () => {
    await clearTables(db, ['mealIngredient', 'meal', 'ingredient'])
  })

  afterEach(async () => {
    await clearTables(db, ['mealIngredient', 'meal', 'ingredient'])
  })

  describe('findMealIngredientById', () => {
    it('should find a meal ingredient by its ID', async () => {
      const [meal1] = await insertAll(db, 'meal', [fakeMeal()])
      const [ingredient1] = await insertAll(db, 'ingredient', [fakeIngredient()])

      const [mealIngredient] = await insertAll(db, 'mealIngredient', [{
        mealId: meal1.id,
        ingredientId: ingredient1.id,
        quantity: 350,
      }])

      const result = await findById({ id: mealIngredient.id })

      expect(result).toMatchObject({
        mealId: meal1.id,
        ingredientId: ingredient1.id,
        quantity: 350,
      })
    })

    it('should throw a NOT_FOUND error if meal ingredient does not exist', async () => {
        await expect(findById({id: 489489498})).rejects.toThrowError(/no results/i)
    })
  })