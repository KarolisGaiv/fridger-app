import config from '@server/config'
import jsonwebtoken from 'jsonwebtoken'
import { TRPCError } from '@trpc/server'
import { parseTokenPayload } from '@server/trpc/tokenPayload'
import { publicProcedure } from '..'

const { tokenKey } = config.auth

function verify(token: string) {
  return jsonwebtoken.verify(token, tokenKey)
}

function getUserFromToken(token: string) {
  try {
    const tokenVerified = verify(token)
    const tokenParsed = parseTokenPayload(tokenVerified)

    return tokenParsed.user
  } catch (error) {
    return null
  }
}

export const authenticatedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (ctx.authUser) {
    // if we have an authenticated user, we can proceed to the next calls disregarding everything after this if statement
    return next({
      ctx: {
        // we create a NEW context here and provide authUser
        // By creating a new context object, we ensure that the original context is not modified.
        authUser: ctx.authUser,
      },
    })
  }

  // We need to ensure we have the request object to know the purpose of the request.
  // The request object (ctx.req) contains essential information like headers, body, etc.
  // Without it, we cannot process the request correctly.
  if (!ctx.req) {
    const message =
      config.env === 'development' || config.env === 'test'
        ? 'Missing Express request object. If you are running tests, make sure to provide some req object in the procedure context.'
        : 'Missing Express request object.'

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message,
    })
  }

  const userToken = ctx.req.header('Authorization')?.replace('Bearer', '')

  if (!userToken) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Unauthenticated. Please log in.',
    })
  }

  const authUser = getUserFromToken(userToken)

  if (!authUser) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid token.',
    })
  }

  return next({
    ctx: {
      authUser,
    },
  })
})
