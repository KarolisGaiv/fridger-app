import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { fakeMeal, fakeUser } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import mealRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealRouter)
let user: any
let user2: any

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[user2] = await insertAll(db, 'user', [fakeUser()])
})

it('should return empty list if there are no meals', async () => {
  // arrange
  const { findAll } = createCaller(authContext({ db }, user))

  // act & assert
  expect(await findAll()).toHaveLength(0)
})

it('should return all meals', async () => {
  // arrange
  await insertAll(db, 'meal', [
    { ...fakeMeal(), user: user.id },
    { ...fakeMeal(), user: user.id },
    { ...fakeMeal(), user: user2.id },
  ])
  const { findAll } = createCaller(authContext({ db }, user))

  // act
  const meals = await findAll()

  // assert
  expect(meals).toHaveLength(2)
})

it('prevents unauth user from using method', async () => {
  // arrange
  const { findAll } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(findAll()).rejects.toThrowError(/unauthenticated/i)
})
