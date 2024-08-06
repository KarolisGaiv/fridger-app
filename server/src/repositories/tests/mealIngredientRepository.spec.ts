import { createTestDatabase } from '@tests/utils/database'
import {
  fakeMeal,
  fakeIngredient,
  fakeMealPlan,
  fakeUser,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { mealIngredientRepository } from '../mealIngredientRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = mealIngredientRepository(db)

beforeAll(async () => {
  await clearTables(db, ['mealIngredient', 'meal', 'ingredient'])
})

describe('create', () => {
  it('should create a new meal ingredient', async () => {
    const [meal1] = await insertAll(db, 'meal', [fakeMeal()])
    const [ingredient1] = await insertAll(db, 'ingredient', [fakeIngredient()])

    const fakeIngr = {
      quantity: 350,
      mealId: meal1.id,
      ingredientId: ingredient1.id,
    }

    const createdIngr = await repository.create(fakeIngr)

    expect(createdIngr).toEqual({
      ingredientId: fakeIngr.ingredientId,
      mealId: fakeIngr.mealId,
      quantity: fakeIngr.quantity,
    })
  })
})

describe('find meal ingredient funcionalities', () => {
  describe('findMealIngredientById', () => {
    it("should find meal ingredient by it's ID", async () => {
      const [meal1] = await insertAll(db, 'meal', [fakeMeal()])
      const [ingredient1] = await insertAll(db, 'ingredient', [
        fakeIngredient(),
      ])

      const [fakeIngr] = await insertAll(db, 'mealIngredient', {
        quantity: 350,
        mealId: meal1.id,
        ingredientId: ingredient1.id,
      })

      const res = await repository.findMealIngredientById(fakeIngr.id)
      expect(res).toMatchObject({
        mealId: meal1.id,
        ingredientId: ingredient1.id,
      })
    })

    it('return nothing if meal ingredient does not exist', async () => {
      const res = await repository.findMealIngredientById(999)
      expect(res).toBeUndefined()
    })
  })

  describe('findIngredientsByMealId', () => {
    it('should find ingredients by meal id', async () => {
      const [meal1] = await insertAll(db, 'meal', [fakeMeal()])
      const [ingredient1, ingredient2] = await insertAll(db, 'ingredient', [
        fakeIngredient(),
        fakeIngredient(),
      ])

      await insertAll(db, 'mealIngredient', [
        { mealId: meal1.id, ingredientId: ingredient1.id, quantity: 200 },
        { mealId: meal1.id, ingredientId: ingredient2.id, quantity: 300 },
      ])

      const ingredients = await repository.findIngredientsByMealId(meal1.id)

      expect(ingredients).toHaveLength(2)
      expect(ingredients).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            mealId: meal1.id,
            ingredientId: ingredient1.id,
            quantity: 200,
          }),
          expect.objectContaining({
            mealId: meal1.id,
            ingredientId: ingredient2.id,
            quantity: 300,
          }),
        ])
      )
    })

    it('should return an empty array if no ingredients are found for the meal', async () => {
      const [meal1] = await insertAll(db, 'meal', [fakeMeal()])

      const ingredients = await repository.findIngredientsByMealId(meal1.id)

      expect(ingredients).toHaveLength(0)
    })
  })

  describe('findIngredientsByMealPlanId', () => {
    let user: any
    let mealPlan: any
    beforeEach(async () => {
      ;[user] = await insertAll(db, 'user', [fakeUser()])
      ;[mealPlan] = await insertAll(db, 'mealPlan', [
        fakeMealPlan({ userId: user.id }),
      ])
    })
    it('should find ingredients by meal plan ID', async () => {
      const [meal1] = await insertAll(db, 'meal', [fakeMeal()])
      const [ingredient1, ingredient2] = await insertAll(db, 'ingredient', [
        fakeIngredient(),
        fakeIngredient(),
      ])

      await insertAll(db, 'mealIngredient', [
        {
          mealId: meal1.id,
          ingredientId: ingredient1.id,
          quantity: 200,
          mealPlan: mealPlan.id,
        },
        {
          mealId: meal1.id,
          ingredientId: ingredient2.id,
          quantity: 300,
          mealPlan: mealPlan.id,
        },
      ])
      const ingredients = await repository.findIngredientsByMealPlanId(
        mealPlan.id
      )

      expect(ingredients).toHaveLength(2)
      expect(ingredients).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            mealId: meal1.id,
            ingredientId: ingredient1.id,
            quantity: 200,
          }),
          expect.objectContaining({
            mealId: meal1.id,
            ingredientId: ingredient2.id,
            quantity: 300,
          }),
        ])
      )
    })

    it('should return an empty array if no ingredients are found for the meal plan', async () => {
      const [meal1] = await insertAll(db, 'meal', [fakeMeal()])

      const ingredients = await repository.findIngredientsByMealPlanId(meal1.id)

      expect(ingredients).toHaveLength(0)
    })

    it('should handle non-existent meal plan ID gracefully', async () => {
      const nonExistentMealPlanId = 999

      const ingredients = await repository.findIngredientsByMealPlanId(
        nonExistentMealPlanId
      )

      expect(ingredients).toHaveLength(0)
    })
  })
})

describe('updateMealIngredient', () => {
  it('should update a meal ingredient successfully', async () => {
    const [meal1] = await insertAll(db, 'meal', [fakeMeal()])
    const [ingredient1] = await insertAll(db, 'ingredient', [
      fakeIngredient(),
      fakeIngredient(),
    ])

    const [mealIngredient] = await insertAll(db, 'mealIngredient', {
      mealId: meal1.id,
      ingredientId: ingredient1.id,
      quantity: 200,
    })

    const updates = {
      quantity: 300,
    }

    const updatedIngredient = await repository.updateMealIngredient(
      mealIngredient.id,
      updates
    )

    expect(updatedIngredient).toMatchObject({
      mealId: meal1.id,
      ingredientId: ingredient1.id,
      quantity: updates.quantity,
    })
  })
})

describe('deleteMealIngredient', () => {
  it('should delete a meal ingredient', async () => {
    const [meal] = await insertAll(db, 'meal', [
      { name: 'Pasta', calories: 400 },
    ])
    const [ingredient] = await insertAll(db, 'ingredient', [{ name: 'Tomato' }])

    const [mealIngredient] = await insertAll(db, 'mealIngredient', [
      {
        mealId: meal.id,
        ingredientId: ingredient.id,
        quantity: 200,
      },
    ])

    await repository.deleteMealIngredient(mealIngredient.id)
    const deletedMealIngredient = await repository.findMealIngredientById(
      mealIngredient.id
    )
    expect(deletedMealIngredient).toBeUndefined()
  })

  it('should not throw an error if meal ingredient is not found', async () => {
    await expect(repository.deleteMealIngredient(999)).resolves.not.toThrow()
  })
})

describe('deleteIngredientsByMealId', () => {
  let mealId: number
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let ingredientIds: number[]

  beforeEach(async () => {
    // Insert a meal
    const [meal] = await insertAll(db, 'meal', [
      { name: 'Pasta', calories: 400 },
    ])
    mealId = meal.id

    // Insert ingredients
    const [ingredient1, ingredient2] = await insertAll(db, 'ingredient', [
      { name: 'Tomato' },
      { name: 'Cheese' },
    ])
    ingredientIds = [ingredient1.id, ingredient2.id]

    // Insert meal ingredients
    await insertAll(db, 'mealIngredient', [
      { mealId, ingredientId: ingredient1.id, quantity: 200 },
      { mealId, ingredientId: ingredient2.id, quantity: 300 },
    ])
  })

  it('should delete ingredients associated with the specified meal ID', async () => {
    await repository.deleteIngredientsByMealId(mealId)

    // Verify that meal ingredients associated with the meal ID are deleted
    const ingredients = await repository.findIngredientsByMealId(mealId)
    expect(ingredients).toHaveLength(0)
  })

  it('should not delete ingredients associated with other meals', async () => {
    const [anotherMeal] = await insertAll(db, 'meal', [
      { name: 'Salad', calories: 300 },
    ])
    const [anotherIngredient] = await insertAll(db, 'ingredient', [
      { name: 'Lettuce' },
    ])

    // Insert a meal ingredient associated with another meal
    await insertAll(db, 'mealIngredient', [
      {
        mealId: anotherMeal.id,
        ingredientId: anotherIngredient.id,
        quantity: 150,
      },
    ])

    await repository.deleteIngredientsByMealId(mealId)

    // Verify that the meal ingredient associated with another meal remains
    const ingredients = await repository.findIngredientsByMealId(anotherMeal.id)
    expect(ingredients).toHaveLength(1)
    expect(ingredients[0]).toMatchObject({
      mealId: anotherMeal.id,
      ingredientId: anotherIngredient.id,
    })
  })

  it('should handle non-existent meal ID gracefully', async () => {
    const nonExistentMealId = 999

    await expect(
      repository.deleteIngredientsByMealId(nonExistentMealId)
    ).resolves.not.toThrow()

    // Verify that no meal ingredients were deleted
    const ingredients = await repository.findIngredientsByMealId(mealId)
    expect(ingredients).toHaveLength(2)
  })
})
