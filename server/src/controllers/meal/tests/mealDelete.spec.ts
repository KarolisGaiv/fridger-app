import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { fakeUser } from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import mealRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealRouter)
let user: any

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

it('should throw error if meal to delete is not found', async () => {
  // arrange
  const { deleteMeal } = createCaller(authContext({ db }, user))

  // act & assert
  await expect(deleteMeal({ name: 'non-existing-meal' })).rejects.toThrowError()

  await insertAll(db, 'meal', { name: 'pizza', calories: 123, user: user.id })
  await expect(deleteMeal({ name: 'non-existing-meal' })).rejects.toThrowError()
})

it('should delete meal', async () => {
  // arrange
  await insertAll(db, 'meal', { name: 'pizza', calories: 123, user: user.id })
  let meals = await selectAll(db, 'meal')
  expect(meals).toHaveLength(1)
  const { deleteMeal } = createCaller(authContext({ db }, user))

  // act & assert
  await expect(deleteMeal({ name: 'pizza' })).resolves.not.toThrowError()
  meals = await selectAll(db, 'meal')
  expect(meals).toHaveLength(0)
})

it('prevents unauth user from using method', async () => {
  // arrange
  const { deleteMeal } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(deleteMeal({ name: 'pizza' })).rejects.toThrowError(
    /unauthenticated/i
  )
})
