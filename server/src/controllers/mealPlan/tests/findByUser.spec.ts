import { authContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { fakeUser, fakeMealPlan } from '@server/entities/tests/fakes'
import mealPlanRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealPlanRouter)
let user: any

beforeEach(async () => {
  await clearTables(db, ['mealPlan', 'user'])
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id, planName: 'User Plan' }),
    fakeMealPlan({ userId: user.id }),
    fakeMealPlan({ userId: user.id }),
  ])
})

describe('findByUserId', () => {
  it('should retrieve all meal plans for a specific user', async () => {
    // arrange
    const { findByUserId } = createCaller(authContext({ db }, user))

    // act
    const result = await findByUserId()

    // assert
    expect(result).toBeDefined()
    expect(result).toHaveLength(3)
    expect(result[0]).toMatchObject({
      planName: 'User Plan',
      userId: user.id,
    })
  })

  it('returns empty array if user has no meal plans', async () => {
    await clearTables(db, ['mealPlan'])
    const { findByUserId } = createCaller(authContext({ db }, user))

    const result = await findByUserId()

    expect(result).toBeDefined()
    expect(result).toHaveLength(0)
    expect(result).toStrictEqual([])
  })

  it('prevents unauth user from using method', async () => {
    // arrange
    const { findByUserId } = createCaller({
      db,
      req: {
        // no Auth header
        header: () => undefined,
      } as any,
    })

    // act & assert
    await expect(findByUserId()).rejects.toThrowError(/unauthenticated/i)
  })
})
