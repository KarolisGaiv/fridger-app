import { createTestDatabase } from '@tests/utils/database'
import { fakeUser } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import userRouter from '..'

const createCaller = createCallerFactory(userRouter)
const db = await wrapInRollbacks(createTestDatabase())
const CORRECT_PASW = 'bestPass123'

const [userSeed] = await insertAll(db, 'user', [
  fakeUser({
    email: 'existing@user.com',
    password: '$2a$12$gEKlXk4d/CxCYPLDDnYo6uij/ajBGCqqKaDtXYBn/NP1xCtPj2ioa', // this is a hashed password of CORRECT_PASW variable. this is what would be stored in db
  }),
])

const { login } = createCaller({ db })

it('returns a token if password matches', async () => {
  const { token } = await login({
    email: userSeed.email,
    password: CORRECT_PASW,
  })

  expect(token).toEqual(expect.any(String))
  expect(token.slice(0, 3)).toEqual('eyJ')
})

it('throws error for non-existant user', async () => {
  await expect(
    login({
      email: 'nonexisting@user.com',
      password: CORRECT_PASW,
    })
  ).rejects.toThrow()
})

it('throws error for incorrect password', async () => {
  await expect(
    login({
      email: userSeed.email,
      password: 'wrongPassword',
    })
  ).rejects.toThrow(/password/i)
})

it('throws error for invalid email', async () => {
  await expect(
    login({
      email: 'notemail',
      password: CORRECT_PASW,
    })
  ).rejects.toThrow(/Invalid email/i)
})

it('throws error for short password', async () => {
  await expect(
    login({
      email: userSeed.email,
      password: 'df',
    })
  ).rejects.toThrow(/Password must be at least 8 characters long/i)
})
