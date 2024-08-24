import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { fakeMeal, fakeUser, fakeMealPlan } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import mealRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealRouter)
let user: any

beforeAll(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

it('should change meal completion status', async () => {
  // arrange
  const [plan1] = await insertAll(db, 'mealPlan', [
    { ...fakeMealPlan(), userId: user.id },
  ])

  const [meal] = await insertAll(db, 'meal', [
    {
      ...fakeMeal(),
      user: user.id,
      mealPlan: plan1.id,
    },
  ])

  const { toggleCompletionStatus } = createCaller(authContext({ db }, user))

  expect(meal.completed).toBe(false)

  // act
  await toggleCompletionStatus({ name: meal.name })
  const [updateMeal] = await selectAll(db, 'meal')

  // assert
  expect(updateMeal.completed).toBe(true)

  await toggleCompletionStatus({ name: meal.name })
  const [updateMeal2] = await selectAll(db, 'meal')

  expect(updateMeal2.completed).toBe(false)
})
