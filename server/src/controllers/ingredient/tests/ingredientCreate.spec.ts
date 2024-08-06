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

it.skip('should create and save new ingredient', async () => {
  // arrange
  const ingredient = fakeIngredient()
  const { create } = createCaller(authContext({ db }, user))

  // act
  const res = await create(ingredient)

  // assert
  expect(res.ingredientCreated).toMatchObject({
    name: ingredient.name,
  })
})

it.skip('prevents unauth user from using method', async () => {
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
