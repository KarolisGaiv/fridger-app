import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import {
  fakeIngredient,
  fakeMealPlan,
  fakeUser,
} from '@server/entities/tests/fakes'
import fridgeRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(fridgeRouter)

let ingredient: any
let mealPlan: any
let groceryListId: number
let realUser: any

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

// prepare testing setup for each test
beforeEach(async () => {
  ;[realUser] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: realUser.id }),
  ])
  ;[ingredient] = await insertAll(db, 'ingredient', [fakeIngredient()])
  groceryListId = await createFakeGroceryList()

  const data = {
    mealPlan: mealPlan.id,
    ingredientId: ingredient.id,
    existingQuantity: 57,
    groceryListId,
    userId: realUser.id,
  }

  await insertAll(db, 'fridgeContent', data)
})

it.skip('returns fridge content for a specific meal plan', async () => {
  const { findByMealPlan } = createCaller(authContext({ db }, realUser))

  const result = await findByMealPlan({ mealPlan: mealPlan.id })

  expect(result).toHaveLength(1)
  expect(result[0].ingredientId).toBe(ingredient.id)
  expect(result[0].existingQuantity).toBe(57)
})

it.skip('returns empty array if no fridge content found for the meal plan', async () => {
  const { findByMealPlan } = createCaller(authContext({ db }, realUser))

  const result = await findByMealPlan({ mealPlan: mealPlan.id + 1 }) // Using a non-existent meal plan ID

  expect(result).toHaveLength(0)
})

it.skip('throws error if meal plan ID is not provided', async () => {
  const { findByMealPlan } = createCaller(authContext({ db }, realUser))

  await expect(findByMealPlan({})).rejects.toThrowError()
})

it.skip('prevents unauthenticated user to get fridge content', async () => {
  const { findByMealPlan } = createCaller({
    db,
    req: {
      // no auth header
      header: () => undefined,
    } as any,
  })

  await expect(findByMealPlan({ mealPlan: mealPlan.id })).rejects.toThrow(
    /unauthenticated/i
  )
})
