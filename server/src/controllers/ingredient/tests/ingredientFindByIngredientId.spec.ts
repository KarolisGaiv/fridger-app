import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { fakeIngredient, fakeUser } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import ingredientRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(ingredientRouter)
let user: any
let ingredient: any

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[ingredient] = await insertAll(db, 'ingredient', {
    ...fakeIngredient(),
    user: user.id,
  })
})

it("should find ingredient name by it's id", async () => {
  // arrange
  const { findByIngredientId } = createCaller(authContext({ db }, user))

  // act
  const res = await findByIngredientId({ id: ingredient.id })

  // assert
  expect(res.name).toBe(ingredient.name)
})

it('throws error if ingredient is not found', async () => {
  const { findByIngredientId } = createCaller(authContext({ db }, user))

  await expect(findByIngredientId({ id: 111 })).rejects.toThrowError(
    /id not found/i
  )
})

it('prevents unauth user from using method', async () => {
  // arrange
  const { findByIngredientId } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(findByIngredientId({ id: 111 })).rejects.toThrowError(
    /unauthenticated/i
  )
})
