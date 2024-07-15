import { createTestDatabase } from '@tests/utils/database'
import { fakeMeal } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { selectAll } from '@tests/utils/records'
import mealRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealRouter)
const { create } = createCaller({ db })

it('should create and save new meal', async () => {
  const meal = fakeMeal()
  const response = await create(meal)

  const [mealCreated] = await selectAll(db, 'meal', (query) =>
    query('name', '=', meal.name)
  )

  expect(mealCreated).toMatchObject({
    id: expect.any(Number),
    ...meal,
  })

  expect(response.mealCreated).toEqual({
    name: mealCreated.name,
    calories: mealCreated.calories,
  })
})
