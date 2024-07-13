import { createTestDatabase } from '@tests/utils/database'
import { fakeMeal } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import mealRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealRouter)

const [meal] = await insertAll(db, 'meal', [fakeMeal()])

const { findByName } = createCaller({ db })

it("should find meal by it's name", async () => {
  const result = await findByName({ name: meal.name })

  expect(result.name).toBe(meal.name)
})

it('throws error if meal is not found', async () => {
  await expect(findByName({ name: 'non existing' })).rejects.toThrowError(
    /name not found/i
  )
})
