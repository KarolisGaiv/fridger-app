import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { fakeUser } from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import ingredientRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(ingredientRouter)
let user: any
let ingredient: any

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[ingredient] = await insertAll(db, 'ingredient', [{ name: 'apple' }])
})

it("should update ingredient's name", async () => {
  // arrange
  const { updateIngredient } = createCaller(authContext({ db }, user))

  // act
  const updatedIngr = await updateIngredient({
    ingredientToUpdate: ingredient.name,
    newName: 'egg',
  })

  // assert
  expect(updatedIngr?.name).toBe('egg')
})

it('should throw error if ingredient to be updated does not exist', async () => {
  const { updateIngredient } = createCaller(authContext({ db }, user))

  await expect(
    updateIngredient({
      ingredientToUpdate: 'non existing',
      newName: 'new Name',
    })
  ).rejects.toThrowError(/this name was not found/i)
})

it('prevents unauth user from using method', async () => {
  // arrange
  const { updateIngredient } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(updateIngredient({ingredientToUpdate: "eggs", newName: "bacon"})).rejects.toThrowError(/Unauthenticated/i)
})
