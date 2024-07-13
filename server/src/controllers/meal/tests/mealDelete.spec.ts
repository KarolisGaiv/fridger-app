import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables, selectAll } from '@tests/utils/records'
import mealRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealRouter)
const { deleteMeal } = createCaller({ db })

beforeEach(async () => {
  await clearTables(db, ['meal'])
})

it('should throw error if meal to delete is not found', async () => {
  await expect(deleteMeal({ name: 'non-existing-meal' })).rejects.toThrowError()

  await insertAll(db, 'meal', { name: 'pizza', calories: 123 })
  await expect(deleteMeal({ name: 'non-existing-meal' })).rejects.toThrowError()
})

it('should delete meal', async () => {
  await insertAll(db, 'meal', { name: 'pizza', calories: 123 })
  let meals = await selectAll(db, 'meal')
  expect(meals).toHaveLength(1)

  await expect(deleteMeal({ name: 'pizza' })).resolves.not.toThrowError()
  meals = await selectAll(db, 'meal')
  expect(meals).toHaveLength(0)
})
