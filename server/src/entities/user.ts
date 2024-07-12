import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { User } from '@server/database/types'
import { idSchema } from './shared'

export const userSchema = z.object({
    id: idSchema,
    email: z.string().toLowerCase().email().trim(),
    password: z.string().min(8, "Password must me at least 8 characters long").max(20, "Password cannot be longer than 20 characters"),
    firstName: z.string().min(1).max(60),
    lastName: z.string().min(1).max(60),
})

export const userKeysAll = Object.keys(userSchema.shape) as (keyof User)[]

export const userKeysPublic = ["id", "firstName", "lastName"] as const

export type UserPublic = Pick<Selectable<User>, (typeof userKeysPublic)[number]>

export const authUserSchema = userSchema.pick({id: true})
export type AuthUser = z.infer<typeof authUserSchema>

