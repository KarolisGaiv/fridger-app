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

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

it('should return empty list if there are no ingredients', async () => {
  const { findAll } = createCaller(authContext({ db }, user))

  expect(await findAll()).toHaveLength(0)
})

it('should return all ingredients', async () => {
  await insertAll(db, 'ingredient', [fakeIngredient(), fakeIngredient()])
  const { findAll } = createCaller(authContext({ db }, user))

  const ingredients = await findAll()

  expect(ingredients).toHaveLength(2)
})

it('prevents unauth user from using method', async () => {
  // arrange
  const { create } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(create(fakeIngredient())).rejects.toThrowError(
    /unauthenticated/i
  )
})
