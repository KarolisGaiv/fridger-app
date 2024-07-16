import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { fakeUser } from '@server/entities/tests/fakes'
import { insertAll, clearTables } from '@tests/utils/records'
import { mealPlanRepository } from '../mealPlanRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = mealPlanRepository(db)
let user: any

beforeEach(async () => {
  await clearTables(db, ['mealPlan', 'user'])
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

describe('create', () => {
  it('should create new meal plan', async () => {
    const mealPlan = {
      userId: user.id,
      planName: 'My Meal Plan',
    }
    const createdMealPlan = await repository.create(mealPlan)
    expect(createdMealPlan).toEqual(expect.objectContaining(mealPlan))
  })

  it('throws error if missing plan name', async () => {
    const mealPlan = {
      userId: user.id,
    }
    // const result = await repository.create(mealPlan)
    await expect(repository.create(mealPlan)).rejects.toThrowError(
      /violates not-null constraint/
    )
  })
})

describe('findById', () => {
  it('should retrieve a meal plan by ID', async () => {
    const mealPlan = {
      userId: user.id,
      planName: 'Test Meal Plan',
    }
    const [insertedMealPlan] = await insertAll(db, 'mealPlan', [mealPlan])

    const foundMealPlan = await repository.findById(insertedMealPlan.id)

    expect(foundMealPlan).toEqual(expect.objectContaining(mealPlan))
  })

  it('should return undefined if meal plan ID does not exist', async () => {
    const nonExistentId = 999

    const foundMealPlan = await repository.findById(nonExistentId)

    expect(foundMealPlan).toBeUndefined()
  })
})
