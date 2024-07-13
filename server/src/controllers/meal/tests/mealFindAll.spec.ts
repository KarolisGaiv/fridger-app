import { createTestDatabase } from '@tests/utils/database'
import { fakeMeal } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import mealRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealRouter)
const { findAll } = createCaller({ db })

await clearTables(db, ['meal'])

it('should return empty list if there are no meals', async () => {
  expect(await findAll()).toHaveLength(0)
})

it('should return all meals', async () => {
  await insertAll(db, 'meal', [fakeMeal(), fakeMeal()])

  const meals = await findAll()

  expect(meals).toHaveLength(2)
})
