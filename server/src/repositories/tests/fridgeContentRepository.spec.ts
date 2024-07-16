import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
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
  }
  const [data] = await insertAll(db, 'groceryList', [list])
  return data.id
}

beforeEach(async () => {
  await clearTables(db, [
    'fridgeContent',
    'ingredient',
    'mealPlan',
    'user',
    'groceryList',
  ])

  // Insert fake data into related tables
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id }),
  ])
  ;[ingredient] = await insertAll(db, 'ingredient', [fakeIngredient()])

  groceryListId = await createFakeGroceryList()
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

    // Assuming we inserted 2 fridge contents
    expect(result).toHaveLength(2)

    // Assert the structure and contents of the returned fridge content
    expect(result[0]).toEqual(
      expect.objectContaining({
        ingredientId: ingredient.id,
        existingQuantity: 10,
      })
    )
    expect(result[1]).toEqual(
      expect.objectContaining({
        ingredientId: ingredient.id,
        existingQuantity: 30,
      })
    )
  })

  it('should return an empty array if no fridge content is found for the user', async () => {
    const result = await repository.findByUser(user.id)

    expect(result).toHaveLength(0)
  })
})
