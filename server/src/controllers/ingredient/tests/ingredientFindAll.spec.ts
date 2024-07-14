import { createTestDatabase } from '@tests/utils/database'
import { fakeIngredient } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import ingredientRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(ingredientRouter)
const { findAll } = createCaller({ db })

await clearTables(db, ['ingredient'])

it('should return empty list if there are no ingredients', async () => {
  expect(await findAll()).toHaveLength(0)
})

it('should return all ingredients', async () => {
  await insertAll(db, 'ingredient', [fakeIngredient(), fakeIngredient()])

  const ingredients = await findAll()

  expect(ingredients).toHaveLength(2)
})