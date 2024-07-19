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

it('allows authenticated user to delete their fridge content', async () => {
  const { deleteByUser, findByUser } = createCaller(
    authContext({ db }, realUser)
  )

  // Verify content exists before deletion
  let result = await findByUser()
  expect(result).toHaveLength(1)

  // Delete fridge content
  await deleteByUser()

  // Verify content is deleted
  result = await findByUser()
  expect(result).toHaveLength(0)
})

it('prevents unauthenticated user to delete fridge', async () => {
  const { deleteByUser } = createCaller({
    db,
    req: { header: () => undefined } as any,
  })

  await expect(deleteByUser()).rejects.toThrowError(/unauthenticated/i)
})
