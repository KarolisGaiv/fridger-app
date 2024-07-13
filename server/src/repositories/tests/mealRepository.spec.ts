import { createTestDatabase } from '@tests/utils/database'
import { fakeMeal } from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import { mealRepository } from '../mealRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = mealRepository(db)

describe('create', () => {
  it('should create a new meal', async () => {
    const meal = fakeMeal()
    const createdMeal = await repository.create(meal)

    expect(createdMeal).toEqual({
      calories: meal.calories,
      name: meal.name,
      id: meal.id,
    })
  })
})

describe("findByName", () => {
  const meal = {
    name: "pancakes",
    calories: 650,
  }
  beforeAll(async () => {
    await insertAll(db, "meal", meal)
  })

  it("should find meal by name", async () => {
    const foundMeal = await repository.findByName(meal.name)

    expect(foundMeal).toMatchObject({
      name: meal.name,
      calories: meal.calories
    })
  })

  it("should return nothing if meal is not found by name", async () => {
    const foundMeal = await repository.findByName("nonExistingMeal")

    expect(foundMeal).toBeUndefined()
  })
})
