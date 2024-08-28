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
let realUser: any

// prepare testing setup for each test
beforeEach(async () => {
  ;[realUser] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: realUser.id }),
  ])
  ;[ingredient] = await insertAll(db, 'ingredient', {
    ...fakeIngredient(),
    user: realUser.id,
  })

  const data = {
    mealPlan: mealPlan.id,
    ingredientId: ingredient.id,
    existingQuantity: 57,
    userId: realUser.id,
  }

  await insertAll(db, 'fridgeContent', data)
})

it('finds users fridge content', async () => {
  const { findByUser } = createCaller(authContext({ db }, realUser))

  const result = await findByUser()
  expect(result).toHaveLength(1)
})

it('prevents unauthenticated user to get fridge content', async () => {
  const { findByUser } = createCaller({
    db,
    req: {
      // no auth header
      header: () => undefined,
    } as any,
  })

  await expect(findByUser()).rejects.toThrow(/unauthenticated/i)
})
