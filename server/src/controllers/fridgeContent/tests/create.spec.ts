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
})

it('allows adding fridge content', async () => {
  // arrange
  const content = {
    mealPlan: mealPlan.id,
    ingredientId: ingredient.id,
    existingQuantity: 32,
  }
  const { create } = createCaller(authContext({ db }, realUser))

  // act
  const result = await create(content)

  // assert
  expect(result).toBeDefined()
  expect(result).toEqual(
    expect.objectContaining({
      ingredientId: content.ingredientId,
      existingQuantity: content.existingQuantity,
    })
  )
})

it('prevents unauthenticated user from adding fridge content', async () => {
  // arrange
  const content = {
    mealPlan: mealPlan.id,
    ingredientId: ingredient.id,
    existingQuantity: 32,
  }
  const { create } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(create(content)).rejects.toThrow(/Unauthenticated/i)
})
