import { createTestDatabase } from '@tests/utils/database'
import { fakeUser } from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import { pick } from 'lodash-es'
import { userKeysPublic } from '@server/entities/user'
import { userRepository, UserRepository } from '../userRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = userRepository(db)

describe('create', () => {
  it('should create a new user', async () => {
    const user = fakeUser()
    const createdUser = await repository.create(user)

    expect(createdUser).toEqual({
      firstName: user.firstName,
      lastName: user.lastName,
      id: expect.any(Number),
    })
  })
})

describe('findByEmail', () => {
  const user = fakeUser()
  beforeAll(async () => {
    await insertAll(db, 'user', user)
  })

  it('should find existing user by email', async () => {
    const userFound = await repository.findByEmail(user.email)

    expect(userFound).toMatchObject({
      id: expect.any(Number),
      ...user,
    })
  })

  it("should return nothing if user is not found by email", async () => {
    const userFound = await repository.findByEmail("nonexisting@email.com")

    expect(userFound).not.toBeDefined()
  })
})
