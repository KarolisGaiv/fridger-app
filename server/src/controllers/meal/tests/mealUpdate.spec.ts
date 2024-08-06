import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { fakeUser } from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import mealRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealRouter)
let user: any

beforeEach(async () => {
  await clearTables(db, ['meal'])
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  await insertAll(db, 'meal', [{ name: 'pancakges', calories: 650 }])
})

it.skip('should update meals name', async () => {
  // arrange
  const { updateMeal } = createCaller(authContext({ db }, user))

  // act
  const updatedMeal = await updateMeal({
    mealName: 'pancakges',
    updateInfo: { name: 'pancakes' },
  })

  // assert
  expect(updatedMeal?.name).toBe('pancakes')
  // calories would not change as they were not in updateInfo
  expect(updatedMeal?.calories).toBe(650)
})

it.skip('should update meals calories', async () => {
  // arrange
  const { updateMeal } = createCaller(authContext({ db }, user))

  // act
  const updatedMeal = await updateMeal({
    mealName: 'pancakges',
    updateInfo: { calories: 420 },
  })

  // assert
  expect(updatedMeal?.calories).toBe(420)
  // name does not change
  expect(updatedMeal?.name).toBe('pancakges')
})

it.skip('should throw error if meal to be updated does not exist', async () => {
  const { updateMeal } = createCaller(authContext({ db }, user))

  await expect(
    updateMeal({ mealName: 'non-exising', updateInfo: { calories: 420 } })
  ).rejects.toThrowError(/this name was not found/i)
})

it.skip('should throw error if more properties are provided than name or calories', async () => {
  const { updateMeal } = createCaller(authContext({ db }, user))

  await expect(
    updateMeal({
      mealName: 'non-exising',
      updateInfo: { calories: 420, invalidProperty: 'oops' },
    })
  ).rejects.toThrowError(/unrecognized key/i)
})

it.skip('prevents unauth user from using method', async () => {
  // arrange
  const { updateMeal } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(
    updateMeal({ mealName: 'pizza', updateInfo: { calories: 420 } })
  ).rejects.toThrowError(/unauthenticated/i)
})
