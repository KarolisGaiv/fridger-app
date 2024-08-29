import { authContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { fakeUser, fakeMealPlan, fakeMeal } from '@server/entities/tests/fakes'
import mealPlanSchedule from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealPlanSchedule)
let user: any
let meal: any
let mealPlan: any

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', {
    ...fakeMealPlan(),
    userId: user.id,
  })
  ;[meal] = await insertAll(db, 'meal', {
    ...fakeMeal(),
    user: user.id,
    mealPlan: mealPlan.id,
  })
})

it('finds all planned meals by plan name', async () => {
  // arrange
  const [mealPlan2] = await insertAll(db, 'mealPlan', {
    ...fakeMealPlan(),
    userId: user.id,
  })

  const [meal2] = await insertAll(db, 'meal', {
    ...fakeMeal(),
    user: user.id,
    mealPlan: mealPlan.id,
  })

  const assignedDay = 5
  const type = 'lunch'

  await insertAll(db, 'mealPlanSchedule', [
    {
      type,
      assignedDay,
      mealId: meal.id,
      mealPlanId: mealPlan.id,
      userId: user.id,
    },
    {
      type,
      assignedDay,
      mealId: meal2.id,
      mealPlanId: mealPlan.id,
      userId: user.id,
    },
    {
      type,
      assignedDay,
      mealId: meal.id,
      mealPlanId: mealPlan2.id,
      userId: user.id,
    },
  ])

  const { find } = createCaller(authContext({ db }, user))

  const result = await find({ mealPlan: mealPlan.planName })

  expect(result).toHaveLength(2)
})

it('prevents unauth user from adding record', async () => {
  const { find } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(find({ mealPlan: mealPlan.planName })).rejects.toThrowError(
    /unauthenticated/i
  )
})
