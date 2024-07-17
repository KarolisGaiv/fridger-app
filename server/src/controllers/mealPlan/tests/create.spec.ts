import { authContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { fakeUser } from '@server/entities/tests/fakes'
import mealPlanRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealPlanRouter)
let user: any

beforeEach(async () => {
  await clearTables(db, ['mealPlan', 'user'])
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

it('allows adding meal plan', async () => {
  // arange
  const { create } = createCaller(authContext({ db }, user))

  // act
  const result = await create({ planName: 'Best plan' })

  // assert
  expect(result).toBeDefined()
  expect(result).toMatchObject({
    planName: 'Best plan',
    userId: user.id,
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
  await expect(create({ planName: 'Worst plan' })).rejects.toThrowError(
    /unauthenticated/i
  )
})
