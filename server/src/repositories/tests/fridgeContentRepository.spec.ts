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
    'meal',
    'ingredient',
    'mealIngredient',
    'mealPlan',
    'user',
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
