/* eslint-disable @typescript-eslint/no-unused-vars */
import { createTestDatabase } from '@tests/utils/database'
import {
  fakeMeal,
  fakeIngredient,
  fakeMealPlan,
  fakeUser,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll, selectAll } from '@tests/utils/records'
import { mealIngredientRepository } from '../mealIngredientRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = mealIngredientRepository(db)
let user: any
let mealPlan: any
let ingredient: any
let ingredient2: any
let meal1: any
let meal2: any

beforeAll(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', {
    ...fakeMealPlan(),
    userId: user.id,
    isActive: true,
  })
  ;[ingredient] = await insertAll(db, 'ingredient', {
    ...fakeIngredient(),
    user: user.id,
  })
  ;[ingredient2] = await insertAll(db, 'ingredient', {
    ...fakeIngredient(),
    user: user.id,
  })
  ;[meal1] = await insertAll(db, 'meal', {
    ...fakeMeal(),
    user: user.id,
    mealPlan: mealPlan.id,
  })
  ;[meal2] = await insertAll(db, 'meal', {
    ...fakeMeal(),
    user: user.id,
    mealPlan: mealPlan.id,
  })
})

describe('create', () => {
  it('should create a new meal ingredient', async () => {
    const fakeIngr = {
      quantity: 350,
      mealId: meal1.id,
      ingredientId: ingredient.id,
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
    beforeAll(async () => {
      const fakeIngr = {
        quantity: 350,
        mealId: meal1.id,
        ingredientId: ingredient.id,
      }
      await insertAll(db, 'mealIngredient', fakeIngr)
    })
    it("should find meal ingredient by it's ID", async () => {
      const data = {
        quantity: 350,
        mealId: meal1.id,
        ingredientId: ingredient.id,
      }
      const [fakeIngr] = await insertAll(db, 'mealIngredient', data)

      const res = await repository.findMealIngredientById(fakeIngr.id)
      expect(res).toMatchObject({
        mealId: meal1.id,
        ingredientId: ingredient.id,
      })
    })

    it('return nothing if meal ingredient does not exist', async () => {
      const res = await repository.findMealIngredientById(999)
      expect(res).toBeUndefined()
    })
  })

  describe('findIngredientsByMealId', () => {
    it('should find ingredients by meal id', async () => {
      await clearTables(db, ["mealIngredient"])
      await insertAll(db, "mealIngredient", [
        {
          quantity: 150,
          mealId: meal1.id,
          ingredientId: ingredient.id
        },
        {
          quantity: 200,
          mealId: meal1.id,
          ingredientId: ingredient2.id
        }
      ])
      const ingredients = await repository.findIngredientsByMealId(meal1.id)

      expect(ingredients).toHaveLength(2)
      expect(ingredients).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            mealId: meal1.id,
            ingredientId: ingredient.id,
            quantity: 150,
          }),
          expect.objectContaining({
            mealId: meal1.id,
            ingredientId: ingredient2.id,
            quantity: 200,
          }),
        ])
      )
    })

    it('should return an empty array if no ingredients are found for the meal', async () => {
      const [meal] = await insertAll(db, 'meal', {...fakeMeal(), user: user.id})
      const ingredients = await repository.findIngredientsByMealId(meal.id)
      expect(ingredients).toHaveLength(0)
    })
  })

  describe('findIngredientsByMealPlanId', () => {
    it('should find ingredients by meal plan ID', async () => {
      await insertAll(db, "mealIngredient", [
        {
          quantity: 150,
          mealId: meal1.id,
          ingredientId: ingredient.id,
          mealPlan: mealPlan.id
        },
        {
          quantity: 200,
          mealId: meal1.id,
          ingredientId: ingredient2.id,
          mealPlan: mealPlan.id
        }
      ])

      const ingredients = await repository.findIngredientsByMealPlanId(
        mealPlan.id
      )

      expect(ingredients).toHaveLength(2)
      expect(ingredients).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            mealId: meal1.id,
            ingredientId: ingredient.id,
            quantity: 150,
          }),
          expect.objectContaining({
            mealId: meal1.id,
            ingredientId: ingredient2.id,
            quantity: 200,
          }),
        ])
      )
    })

    it('should return an empty array if no ingredients are found for the meal plan', async () => {
      const [meal] = await insertAll(db, 'meal', {...fakeMeal(), user: user.id})

      const ingredients = await repository.findIngredientsByMealPlanId(meal.id)

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
    const fakeIngr = {
      quantity: 350,
      mealId: meal1.id,
      ingredientId: ingredient.id,
      mealPlan: mealPlan.id
    }

    const [createdIngr] = await insertAll(db, "mealIngredient", fakeIngr)
    const updates = {
      quantity: 300,
    }

    expect(createdIngr.quantity).toBe(fakeIngr.quantity)

    const updatedIngredient = await repository.updateMealIngredient(
      createdIngr.id,
      updates
    )
    expect(updatedIngredient?.quantity).toBe(updates.quantity)
  })
})

describe('deleteMealIngredient', () => {
  it('should delete a meal ingredient', async () => {
    const data1 = {
      quantity: 350,
      mealId: meal1.id,
      ingredientId: ingredient.id,
      mealPlan: mealPlan.id
    }

    const data2 = {
      quantity: 420,
      mealId: meal1.id,
      ingredientId: ingredient2.id,
      mealPlan: mealPlan.id
    }

    const [fakeIngr1, fakeIngr2] = await insertAll(db, "mealIngredient", [data1, data2])

    await repository.deleteMealIngredient(fakeIngr2.id)
    const deletedMealIngredient = await repository.findMealIngredientById(
      fakeIngr2.id
    )
    expect(deletedMealIngredient).toBeUndefined()
  })

  it('should not throw an error if meal ingredient is not found', async () => {
    await expect(repository.deleteMealIngredient(999)).resolves.not.toThrow()
  })
})

describe('deleteIngredientsByMealId', () => {
  beforeAll(async () => {
    const data1 = {
    quantity: 350,
    mealId: meal1.id,
    ingredientId: ingredient.id,
    mealPlan: mealPlan.id
  }

  const data2 = {
    quantity: 420,
    mealId: meal1.id,
    ingredientId: ingredient2.id,
    mealPlan: mealPlan.id
  }

  const [fakeIngr1, fakeIngr2] = await insertAll(db, "mealIngredient", [data1, data2])
  })
 
  it('should delete ingredients associated with the specified meal ID', async () => {
    const dataBeforeDeletion = await repository.findIngredientsByMealId(meal1.id)
    expect(dataBeforeDeletion).toHaveLength(3)
    
    await repository.deleteIngredientsByMealId(meal1.id)

    // Verify that meal ingredients associated with the meal ID are deleted
    const ingredients = await repository.findIngredientsByMealId(meal1.id)
    expect(ingredients).toHaveLength(0)
  })

  it('should not delete ingredients associated with other meals', async () => {
    const data2 = {
      quantity: 420,
      mealId: meal2.id,
      ingredientId: ingredient2.id,
      mealPlan: mealPlan.id
    }

    await insertAll(db, "mealIngredient", [data2])

    await repository.deleteIngredientsByMealId(meal1.id)

    // Verify that the meal ingredient associated with another meal remains
    const ingredients = await repository.findIngredientsByMealId(meal2.id)
    expect(ingredients).toHaveLength(1)
    expect(ingredients[0].mealId).toBe(meal2.id)
  })

  it('should handle non-existent meal ID gracefully', async () => {
    const dataBefore = await selectAll(db, "mealIngredient");
    expect(dataBefore).not.toHaveLength(0)

    const nonExistentMealId = 999

    await expect(
      repository.deleteIngredientsByMealId(nonExistentMealId)
    ).resolves.not.toThrow()

    // Verify that no meal ingredients were deleted
    const dataAfter = await selectAll(db, "mealIngredient");
    expect(dataAfter.length).toBeGreaterThan(0)
  })
})
