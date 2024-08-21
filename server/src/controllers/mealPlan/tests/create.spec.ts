import { authContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { fakeUser } from '@server/entities/tests/fakes'
import mealPlanRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealPlanRouter)
let user: any

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

it('allows adding meal plan', async () => {
  // arange
  const { create } = createCaller(authContext({ db }, user))

  // act
  const result1 = await create({ planName: 'Best plan', isActive: true })
  const result2 = await create({ planName: 'Best plan', isActive: false })

  // assert
  expect(result1).toBeDefined()
  expect(result1).toMatchObject({
    planName: 'Best plan',
    userId: user.id,
    isActive: true
  })
  expect(result2).toBeDefined()
  expect(result2).toMatchObject({
    planName: 'Best plan',
    userId: user.id,
    isActive: false
  })
})

it('prevents unauth user from adding meal plan', async () => {
  // arrange
  const { create } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(create({ planName: 'Worst plan', isActive: true })).rejects.toThrowError(
    /unauthenticated/i
  )
})
