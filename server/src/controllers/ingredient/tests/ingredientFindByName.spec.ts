import { createTestDatabase } from '@tests/utils/database'
import { fakeIngredient } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import ingredientRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(ingredientRouter)
const { findByName } = createCaller({ db })

const [ingredient] = await insertAll(db, 'ingredient', fakeIngredient())

it('should find ingredient by its name', async () => {
  const res = await findByName({ name: ingredient.name })

  expect(res.name).toBe(ingredient.name)
})

it('throws error if ingredient is not found', async () => {
  await expect(findByName({ name: 'non existing' })).rejects.toThrowError(
    /name not found/i
  )
})
