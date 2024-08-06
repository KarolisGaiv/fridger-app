import { createTestDatabase } from '@tests/utils/database'
import { authContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import {
  fakeUser,
  fakeMealPlan,
  fakeIngredient,
} from '@server/entities/tests/fakes'
import groceryListRouter from '..'

let user: any
let mealPlan: any
let groceryList: any
let ingredient: any

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(groceryListRouter)

async function createFakeGroceryList() {
  const list = {
    mealPlanId: mealPlan.id,
    product: 'Apples',
    quantity: 5,
    ingredientId: ingredient.id,
  }
  const [data] = await insertAll(db, 'groceryList', [list])
  return { id: data.id, ...list }
}

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id }),
  ])
  ;[ingredient] = await insertAll(db, 'ingredient', fakeIngredient())
  groceryList = await createFakeGroceryList()
})

describe('update', () => {
  it('should update an existing grocery list item', async () => {
    // arrange
    const updates = {
      product: 'Oranges',
      quantity: 10,
    }
    const { update } = createCaller(authContext({ db }, user))

    // act
    const updatedGroceryList = await update({
      groceryListId: groceryList.id,
      updateInfo: updates,
    })

    // assert
    expect(updatedGroceryList).toEqual(
      expect.objectContaining({
        mealPlanId: groceryList.mealPlanId,
        product: updates.product,
        quantity: updates.quantity,
      })
    )
  })

  it('should throw an error if the grocery list item is not found', async () => {
    const nonExistentId = 999 // Assuming 999 does not exist in your test data
    const { update } = createCaller(authContext({ db }, user))

    await expect(
      update({
        groceryListId: nonExistentId,
        updateInfo: { product: 'Oranges' },
      })
    ).rejects.toThrow(/list not found/i)
  })

  it('prevents unauth user from using method', async () => {
    // arrange
    const { update } = createCaller({
      db,
      req: {
        // no Auth header
        header: () => undefined,
      } as any,
    })

    // act & assert
    await expect(
      update({ groceryListId: 289, updateInfo: { product: 'egg' } })
    ).rejects.toThrowError(/unauthenticated/i)
  })
})
