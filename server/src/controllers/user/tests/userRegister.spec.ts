import { createTestDatabase } from '@tests/utils/database'
import { fakeUser } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { selectAll } from '@tests/utils/records'
import { random } from '@tests/utils/random'
import userRouter from '..'


const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(userRouter)
const { register } = createCaller({ db })

it("should save a user", async () => {
    const user = fakeUser()
    const response = await register(user)

    const [userCreated] = await selectAll(db, 'user', (query) =>
        query('email', '=', user.email)
      )

    expect(userCreated).toMatchObject({
        id: expect.any(Number),
    ...user,
    password: expect.not.stringContaining(user.password),
    })

    expect(userCreated.password).toHaveLength(60)

  expect(response).toEqual({
    id: userCreated.id,
  })

})