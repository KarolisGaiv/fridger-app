import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables, selectAll } from '@tests/utils/records'
import {
  fakeUser,
  fakeIngredient,
  fakeMealPlan,
} from '@server/entities/tests/fakes'
import { fridgeContentRepository } from '../fridgeContentRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = fridgeContentRepository(db)

let user: any
let ingredient: any
let mealPlan: any
let groceryListId: number

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
    groceryListId,
    ingredientId: ingredient.id,
    mealPlan: mealPlan.id,
    existingQuantity: quantity,
  }
  await insertAll(db, 'fridgeContent', [fridgeContent])
  return mealPlan
}

beforeEach(async () => {
  // Insert fake data into related tables
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id }),
  ])
  ;[ingredient] = await insertAll(db, 'ingredient', [fakeIngredient()])

  groceryListId = await createFakeGroceryList()

  const fridgeContents = [
    {
      userId: user.id,
      groceryListId,
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
      groceryListId,
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

  it('should throw an error if required fields are missing', async () => {
    const fridgeContent = {
      userId: 1,
      groceryListId: 1,
      // Missing ingredientId which is required
      existingQuantity: 10,
    }

    await expect(repository.create(fridgeContent)).rejects.toThrow(
      /violates not-null constraint/i
    )
  })
})

describe('findByUser', () => {
  it('should return fridge content for a specific user', async () => {
    const fridgeContent = {
      userId: user.id,
      groceryListId,
      ingredientId: ingredient.id,
      mealPlan: mealPlan.id,
      existingQuantity: 10,
    }

    const fridgeContent2 = {
      userId: user.id,
      groceryListId,
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
        mealPlan: mealPlan.id,
        ingredientId: ingredient.id,
        existingQuantity: fridgeContent.existingQuantity,
      })
    )
    expect(result[2]).toEqual(
      expect.objectContaining({
        ingredientId: ingredient.id,
        existingQuantity: fridgeContent2.existingQuantity,
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
    const fridgeContent = {
      userId: user.id,
      groceryListId,
      ingredientId: ingredient.id,
      mealPlan: mealPlan.id,
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

    // Act
    await repository.updateQuantity(ingredient.id, newQuantity)

    // Assert
    const [fridgeContent] = await selectAll(db, 'fridgeContent')
    const newFridgeQuantity = fridgeContent.existingQuantity

    expect(oldFridgeContent.existingQuantity).not.toEqual(newFridgeQuantity)
    expect(fridgeContent?.existingQuantity).toEqual(newQuantity)
  })
})
