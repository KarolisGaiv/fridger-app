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
  ;[ingredient] = await insertAll(db, 'ingredient', {...fakeIngredient(), user: user.id})
})

it('should find ingredient by its name', async () => {
  // arrange
  const { findByName } = createCaller(authContext({ db }, user))

  // act
  const res = await findByName({ name: ingredient.name })

  // assert
  expect(res.name).toBe(ingredient.name)
})

it('throws error if ingredient is not found', async () => {
  const { findByName } = createCaller(authContext({ db }, user))

  await expect(findByName({ name: 'non existing' })).rejects.toThrowError(
    /name not found/i
  )
})

it('prevents unauth user from using method', async () => {
  // arrange
  const { findByName } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(findByName({ name: 'non existing' })).rejects.toThrowError(
    /unauthenticated/i
  )
})
