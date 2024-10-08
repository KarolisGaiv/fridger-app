/* eslint-disable @typescript-eslint/no-unused-vars */
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables, selectAll } from '@tests/utils/records'
import {
  fakeUser,
  fakeIngredient,
  fakeMealPlan,
  fakeMeal,
} from '@server/entities/tests/fakes'
import { fridgeContentRepository } from '../fridgeContentRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = fridgeContentRepository(db)

let user: any
let ingredient: any
let mealPlan: any
let groceryListId: number
let meal: any

async function createFakeGroceryList() {
  const list = {
    mealPlanId: mealPlan.id,
    product: 'snake oil',
    quantity: 30,
    ingredientId: ingredient.id,
  }
  const [data] = await insertAll(db, 'groceryList', [list])
  return data.id
}

async function insertMealPlanWithFridgeContent(quantity: number) {
  ;[mealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id }),
  ])
  const fridgeContent = {
    userId: user.id,
    ingredientId: ingredient.id,
    mealPlan: mealPlan.id,
    existingQuantity: quantity,
  }
  await insertAll(db, 'fridgeContent', [fridgeContent])
  return mealPlan
}

beforeAll(async () => {
  // Insert fake data into related tables
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id }),
  ])
  ;[meal] = await insertAll(db, 'meal', {
    ...fakeMeal(),
    user: user.id,
    mealPlan: mealPlan.id,
  })
  ;[ingredient] = await insertAll(db, 'ingredient', {
    ...fakeIngredient(),
    user: user.id,
  })

  groceryListId = await createFakeGroceryList()

  const fridgeContents = [
    {
      userId: user.id,
      ingredientId: ingredient.id,
      mealPlan: mealPlan.id,
      existingQuantity: 10,
    },
  ]

  await insertAll(db, 'fridgeContent', fridgeContents)
})

describe('create', () => {
  it('should create new fridge content', async () => {
    const fridgeContent = {
      userId: user.id,
      ingredientId: ingredient.id,
      mealPlan: mealPlan.id,
      existingQuantity: 10,
    }

    const createdFridgeContent = await repository.create(fridgeContent)
    expect(createdFridgeContent).toEqual(
      expect.objectContaining({
        ingredientId: fridgeContent.ingredientId,
        existingQuantity: fridgeContent.existingQuantity,
      })
    )

    expect(createdFridgeContent.ingredientId).toEqual(
      fridgeContent.ingredientId
    )
    expect(createdFridgeContent.existingQuantity).toEqual(
      fridgeContent.existingQuantity
    )
  })
})

describe('findByUser', () => {
  it('should return fridge content for a specific user', async () => {
    const fridgeContent = {
      userId: user.id,
      ingredientId: ingredient.id,
      mealPlan: mealPlan.id,
      existingQuantity: 10,
    }

    const fridgeContent2 = {
      userId: user.id,
      ingredientId: ingredient.id,
      mealPlan: mealPlan.id,
      existingQuantity: 30,
    }

    await insertAll(db, 'fridgeContent', [fridgeContent, fridgeContent2])

    const result = await repository.findByUser(user.id)

    expect(result).toHaveLength(3)

    // Assert the structure and contents of the returned fridge content
    expect(result[1]).toEqual(
      expect.objectContaining({
        name: ingredient.name,
        existingQuantity: fridgeContent.existingQuantity,
      })
    )
  })

  it('should return an empty array if no fridge content is found for the user', async () => {
    await clearTables(db, ['fridgeContent'])
    const result = await repository.findByUser(user.id)

    expect(result).toHaveLength(0)
  })
})

describe('findByMealPlan', () => {
  it('should return fridge content for specific meal plans', async () => {
    // Insert fridge content for multiple meal plans
    const mealPlan1 = await insertMealPlanWithFridgeContent(10)
    const mealPlan2 = await insertMealPlanWithFridgeContent(20)

    // Retrieve fridge content for each meal plan
    const result1 = await repository.findByMealPlan(mealPlan1.id)
    const result2 = await repository.findByMealPlan(mealPlan2.id)

    expect(result1).toHaveLength(1) // Assuming inserted 1 fridge content for meal plan 1
    expect(result1[0]).toMatchObject({
      ingredientId: ingredient.id,
      existingQuantity: 10,
      mealPlan: mealPlan1.id,
    })

    expect(result2).toHaveLength(1) // Assuming inserted 1 fridge content for meal plan 2
    expect(result2[0]).toMatchObject({
      ingredientId: ingredient.id,
      existingQuantity: 20, // Assuming different quantity for meal plan 2
      mealPlan: mealPlan2.id,
    })
  })

  it('should return an empty array if no fridge content is found for the meal plan', async () => {
    const result = await repository.findByMealPlan(999) // Non-existent meal plan ID

    expect(result).toHaveLength(0)
  })
})

describe('deleteByUserId', () => {
  it('should delete fridge content for a specific user', async () => {
    await insertMealPlanWithFridgeContent(10)
    await insertMealPlanWithFridgeContent(30)
    await insertMealPlanWithFridgeContent(30)

    const userData = await repository.findByUser(user.id)
    expect(userData).toHaveLength(4)

    await repository.deleteByUserId(user.id)

    // Check if fridge content is deleted
    const result = await repository.findByUser(user.id)
    expect(result).toHaveLength(0)
  })
})

describe('findByUserAndProduct', () => {
  it('should find existing item in users fridge', async () => {
    // Arrange
    const [mealPlanFromDatabase] = await selectAll(db, 'mealPlan')
    const fridgeContent = {
      userId: user.id,
      ingredientId: ingredient.id,
      mealPlan: mealPlanFromDatabase.id,
      existingQuantity: 10,
    }

    await repository.create(fridgeContent)

    // Act
    const result = await repository.findByUserAndProduct(user.id, ingredient.id)

    // Assert
    expect(result).toBeDefined()
    expect(result).toMatchObject({
      ingredientId: ingredient.id,
      existingQuantity: 10,
    })
  })

  it("should return null if item is not found in user's fridge", async () => {
    // Arrange - Ensure no existing fridge content for user and product
    await clearTables(db, ['fridgeContent'])

    // Act
    const result = await repository.findByUserAndProduct(user.id, ingredient.id)

    // Assert
    expect(result).toBeNull()
  })
})

describe('updateQuantity', () => {
  it('should update quantity of existing fridge content item', async () => {
    // Arrange
    const newQuantity = 15
    const [oldFridgeContent] = await selectAll(db, 'fridgeContent')
    const oldQuantity = oldFridgeContent.existingQuantity!

    // Act
    // await repository.updateQuantity(ingredient.id, newQuantity)
    await repository.updateQuantity(user.id, ingredient.id, newQuantity)

    // Assert
    const [fridgeContent] = await selectAll(db, 'fridgeContent')
    const newFridgeQuantity = fridgeContent.existingQuantity

    expect(oldFridgeContent.existingQuantity).not.toEqual(newFridgeQuantity)
    expect(fridgeContent?.existingQuantity).toEqual(newQuantity + oldQuantity)
  })
})
