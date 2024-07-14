import type { Database } from '@server/database'
import { userRepository } from '@server/repositories/userRepository'
import { mealRepository } from '@server/repositories/mealRepository'
import { ingredientRepository } from '@server/repositories/ingredientRepository'

export type RepositoryFactory = <T>(db: Database) => T

// index of all repositories for provideRepos
const repositories = { userRepository, mealRepository, ingredientRepository }

export type RepositoriesFactories = typeof repositories
export type Repositories = {
  [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>
}
export type RepositoriesKeys = keyof Repositories

export { repositories }
