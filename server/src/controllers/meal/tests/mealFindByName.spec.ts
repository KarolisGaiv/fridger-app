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

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

it("should find meal by it's name", async () => {
  // arrange
  const [meal] = await insertAll(db, 'meal', { ...fakeMeal(), user: user.id })
  const { findByName } = createCaller(authContext({ db }, user))

  // act
  const result = await findByName({ name: meal.name })

  // assert
  expect(result.name).toBe(meal.name)
})

it('throws error if meal is not found', async () => {
  const { findByName } = createCaller(authContext({ db }, user))
  await expect(findByName({ name: 'non existing' })).rejects.toThrowError(
    /name not found/i
  )
})

it('prevents unauth user from using method', async () => {
  // arrange
  const { findByName } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(findByName({ name: 'Jude' })).rejects.toThrowError(
    /unauthenticated/i
  )
})
