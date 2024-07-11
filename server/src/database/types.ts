import type { ColumnType } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export interface FridgeContent {
  existingQuantity: number | null
  groceryListId: number | null
  id: Generated<number>
  userId: number
}

export interface GroceryList {
  id: Generated<number>
  mealPlanId: number | null
  product: string
  quantity: number
}

export interface MealPlans {
  id: Generated<number>
  planName: string
  userId: number
}

export interface Meals {
  calories: number
  id: Generated<number>
  name: string
}

export interface User {
  email: string
  firstName: string
  id: Generated<number>
  lastName: string
  password: string
}

export interface DB {
  fridgeContent: FridgeContent
  groceryList: GroceryList
  mealPlans: MealPlans
  meals: Meals
  user: User
}
