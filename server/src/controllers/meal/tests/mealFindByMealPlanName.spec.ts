import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { fakeMeal, fakeUser, fakeMealPlan } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import mealRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealRouter)
let user: any

beforeAll(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

it('should find meals by meal plan ID', async () => {
  const [user2] = await insertAll(db, 'user', [fakeUser()])
  // arrange
  const [plan1, plan2] = await insertAll(db, 'mealPlan', [
    { ...fakeMealPlan(), userId: user.id },
    { ...fakeMealPlan(), userId: user2.id },
  ])
  await insertAll(db, 'meal', [
    {
      ...fakeMeal(),
      user: user.id,
      mealPlan: plan1.id,
    },
    {
      ...fakeMeal(),
      user: user.id,
      mealPlan: plan1.id,
    },
    {
      ...fakeMeal(),
      user: user.id,
      mealPlan: plan1.id,
    },
    {
      ...fakeMeal(),
      user: user2.id,
      mealPlan: plan2.id,
    },
    {
      ...fakeMeal(),
      user: user2.id,
      mealPlan: plan2.id,
    },
  ])
  const { findByMealPlanName } = createCaller(authContext({ db }, user))

  // act
  const resultForUser = await findByMealPlanName({ planName: plan1.planName })

  // assert
  expect(resultForUser).toHaveLength(3)
})

it('throws err if meal plan does not exist', async () => {
  const { findByMealPlanName } = createCaller(authContext({ db }, user))

  await expect(
    findByMealPlanName({ planName: 'DOES NOT EXIST' })
  ).rejects.toThrowError(/plan with this name not found/i)
})

it('prevents unauth user from using method', async () => {
  // arrange
  const { findByMealPlanName } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(findByMealPlanName({ planName: 'Jude' })).rejects.toThrowError(
    /unauthenticated/i
  )
})
