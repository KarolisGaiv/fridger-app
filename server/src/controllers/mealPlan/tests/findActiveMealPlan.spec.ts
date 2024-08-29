/* eslint-disable @typescript-eslint/no-unused-vars */
import { authContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll, selectAll } from '@tests/utils/records'
import { fakeUser, fakeMealPlan } from '@server/entities/tests/fakes'
import mealPlanRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealPlanRouter)
let user: any
let mealPlan: any
let mealPlan2: any

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

describe('findActiveMealPlan', () => {
  it('should throw a NOT_FOUND error if active meal plan is not found', async () => {
    // arrange
    const { findActiveMealPlan } = createCaller(authContext({ db }, user))

    // Act & Assert
    await expect(findActiveMealPlan()).rejects.toThrowError(
      /no active meal plan found/i
    )
  })

  it('should find meal plan with active status', async () => {
    ;[mealPlan] = await insertAll(db, 'mealPlan', {
      userId: user.id,
      planName: 'First Plan',
      isActive: false,
    })
    ;[mealPlan2] = await insertAll(db, 'mealPlan', {
      userId: user.id,
      planName: 'Second Plan',
      isActive: true,
    })

    // arrange
    const { findActiveMealPlan } = createCaller(authContext({ db }, user))

    // act
    const res = await findActiveMealPlan()

    // assert
    expect(res).toBe('Second Plan')
  })

  it('prevents unauth user from using method', async () => {
    // arrange
    const { findActiveMealPlan } = createCaller({
      db,
      req: {
        // no Auth header
        header: () => undefined,
      } as any,
    })

    // act & assert
    await expect(findActiveMealPlan()).rejects.toThrowError(/unauthenticated/i)
  })
})
