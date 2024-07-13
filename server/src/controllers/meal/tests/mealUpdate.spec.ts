import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import mealRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealRouter)
const { updateMeal } = createCaller({ db })

beforeEach(async () => {
  await clearTables(db, ['meal'])
  await insertAll(db, 'meal', [{ name: 'pancakges', calories: 650 }])
})

it('should update meals name', async () => {
  const updatedMeal = await updateMeal({
    mealName: 'pancakges',
    updateInfo: { name: 'pancakes' },
  })

  expect(updatedMeal?.name).toBe('pancakes')
  // calories would not change as they were not in updateInfo
  expect(updatedMeal?.calories).toBe(650)
})

it('should update meals calories', async () => {
  const updatedMeal = await updateMeal({
    mealName: 'pancakges',
    updateInfo: { calories: 420 },
  })

  expect(updatedMeal?.calories).toBe(420)
  // name does not change
  expect(updatedMeal?.name).toBe('pancakges')
})

it('should throw error if meal to be updated does not exist', async () => {
  await expect(
    updateMeal({ mealName: 'non-exising', updateInfo: { calories: 420 } })
  ).rejects.toThrowError(/this name was not found/i)
})

it('should throw error if more properties are provided than name or calories', async () => {
  await expect(
    updateMeal({
      mealName: 'non-exising',
      updateInfo: { calories: 420, invalidProperty: 'oops' },
    })
  ).rejects.toThrowError(/unrecognized key/i)
})
