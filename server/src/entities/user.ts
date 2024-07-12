import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { User } from '@server/database/types'
import { idSchema } from './shared'

export const userSchema = z.object({
  id: idSchema,
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(20, 'Password cannot be longer than 20 characters'),
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
})

/**
 * Represents an array of keys extracted from the shape of the userSchema object.
 * These keys correspond to properties of the User type.
 * @type {(keyof User)[]}
 */
export const userKeysAll = Object.keys(userSchema.shape) as (keyof User)[]

/**
 * Represents a readonly tuple of keys that define which user properties are considered public.
 * These keys are constants and cannot be modified.
 * @type {readonly ['id', 'firstName', 'lastName']}
 */
export const userKeysPublic = ['id', 'firstName', 'lastName'] as const

/**
 * Represents a subset of user information that is safe to expose publicly.
 * This type ensures that only specific properties of the User object are included.
 * @typedef {Pick<Selectable<User>, (typeof userKeysPublic)[number]>} UserPublic
 */
export type UserPublic = Pick<Selectable<User>, (typeof userKeysPublic)[number]>

export const authUserSchema = userSchema.pick({ id: true })
export type AuthUser = z.infer<typeof authUserSchema>
