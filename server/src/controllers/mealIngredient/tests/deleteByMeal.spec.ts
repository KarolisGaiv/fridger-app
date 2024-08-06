/* eslint-disable @typescript-eslint/no-unused-vars */
import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import {
  fakeMeal,
  fakeIngredient,
  fakeUser,
} from '@server/entities/tests/fakes'
import mealIngredientRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealIngredientRouter)
let user: any
let meal: any

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[meal] = await insertAll(db, 'meal', [fakeMeal()])
})

it('should delete ingredients by meal ID', async () => {
  // arrange
  const [meal1] = await insertAll(db, 'meal', [fakeMeal()])
  const [ingredient1, ingredient2] = await insertAll(db, 'ingredient', [
    fakeIngredient(),
    fakeIngredient(),
  ])
  await insertAll(db, 'mealIngredient', [
    { mealId: meal1.id, ingredientId: ingredient1.id, quantity: 200 },
    { mealId: meal1.id, ingredientId: ingredient2.id, quantity: 300 },
  ])

  const { deleteIngredientsByMealId } = createCaller(authContext({ db }, user))

  // act
  await deleteIngredientsByMealId({ mealId: meal1.id })
  const remainingIngredients = await db
    .selectFrom('mealIngredient')
    .where('mealId', '=', meal1.id)
    .execute()

  // assert
  expect(remainingIngredients).toHaveLength(0)
})

it('should do nothing if no ingredients are found for the meal ID', async () => {
  const { deleteIngredientsByMealId } = createCaller(authContext({ db }, user))
  const [meal1] = await insertAll(db, 'meal', [fakeMeal()])

  await deleteIngredientsByMealId({ mealId: meal1.id }) // Attempting to delete, but no ingredients exist

  const remainingIngredients = await db
    .selectFrom('mealIngredient')
    .where('mealId', '=', meal1.id)
    .execute()

  expect(remainingIngredients).toHaveLength(0)
})

it('prevents unauth user from using procedure', async () => {
  const { deleteIngredientsByMealId } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  await expect(
    deleteIngredientsByMealId({
      mealId: 2,
    })
  ).rejects.toThrowError(/unauthenticated/i)
})
