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

describe('findById', () => {
  it('should retrieve the meal plan for a specific user', async () => {
    // Arrange
    const mealPlanData = {
      userId: user.id,
      planName: 'User Plan',
    }
    const [mealPlan] = await insertAll(db, 'mealPlan', [mealPlanData])

    const { findById } = createCaller(authContext({ db }, user))

    // Act
    const result = await findById({ id: mealPlan.id })

    // Assert
    expect(result).toBeDefined()
    expect(result.id).toEqual(mealPlan.id)
    expect(result.planName).toEqual('User Plan')
  })

  it('should throw a FORBIDDEN error if authenticated user does not own the meal plan', async () => {
    // Arrange
    const mealPlanData = {
      userId: user.id,
      planName: 'User Plan',
    }
    const [mealPlan] = await insertAll(db, 'mealPlan', [mealPlanData])

    const otherUser = await insertAll(db, 'user', [fakeUser()])

    const { findById } = createCaller(authContext({ db }, otherUser[0]))

    // Act & Assert
    await expect(findById({ id: mealPlan.id })).rejects.toThrowError(
      /not authorized to access this meal plan/i
    )
  })

  it('should throw an error if meal plan is not found', async () => {
    // Arrange
    const { findById } = createCaller(authContext({ db }, user))

    // Act & Assert
    await expect(findById({ id: 999 })).rejects.toThrowError(
      /meal plan not found/i
    )
  })

  it('should prevent unauthorized user from accessing meal plan', async () => {
    // arrange
    const { findById } = createCaller({
      db,
      req: {
        // no Auth header
        header: () => undefined,
      } as any,
    })

    // act & assert
    await expect(findById({ id: 56 })).rejects.toThrowError(/unauthenticated/i)
  })
})
