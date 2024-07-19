import type { Database } from '@server/database'
import { groceryListServices } from '@server/services/groceryListServices'
import { fridgeContentService } from '@server/services/fridgeContentServices'

export type ServiceFactory = <T>(db: Database) => T

// Index of all services
const services = {
  groceryListServices,
  fridgeContentService,
}

export type ServicesFactories = typeof services
export type Services = {
  [K in keyof ServicesFactories]: ReturnType<ServicesFactories[K]>
}
export type ServicesKeys = keyof Services

export { services }
