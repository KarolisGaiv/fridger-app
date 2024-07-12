import { router } from '@server/trpc'
import register from './register'
import login from "./login"

export default router({
  register,
  login
})
