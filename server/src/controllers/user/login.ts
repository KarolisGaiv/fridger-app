import bcrypt from 'bcrypt'
import config from '@server/config'
import jsonwebtoken from 'jsonwebtoken'
import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import { userSchema } from '@server/entities/user'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import { prepareTokenPayload } from '@server/trpc/tokenPayload'

const { expiresIn, tokenKey } = config.auth

export default publicProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .input(
    userSchema.pick({
      // select only email and password in order for user to login
      email: true,
      password: true,
    })
  )
  .mutation(
    async ({
      input: { email, password },
      ctx: { repos: databaseRepositories },
    }) => {
      const user = await databaseRepositories.userRepository.findByEmail(email)

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Cannot find a user with this email address',
        })
      }

      const passwordMatch = await bcrypt.compare(password, user.password)

      if (!passwordMatch) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Wrong password',
        })
      }

      // prepare payload before providing token
      const payload = prepareTokenPayload(user)

      // create token for authenticated and logged user
      const accessToken = jsonwebtoken.sign(payload, tokenKey, {
        expiresIn,
      })

      return {
        accessToken,
      }
    }
  )
