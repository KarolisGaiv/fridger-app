import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import ingredientRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(ingredientRouter)
const { updateIngredient } = createCaller({ db })

beforeEach(async () => {
  await clearTables(db, ['ingredient'])
  await insertAll(db, 'ingredient', [{ name: 'apple' }])
})

it("should update ingredient's name", async () => {
  const updatedIngr = await updateIngredient({
    ingredientToUpdate: 'apple',
    newName: 'egg',
  })

  expect(updatedIngr?.name).toBe('egg')
})

it('should throw error if ingredient to be updated does not exist', async () => {
  await expect(
    updateIngredient({
      ingredientToUpdate: 'non existing',
      newName: 'new Name',
    })
  ).rejects.toThrowError(/this name was not found/i)
})
