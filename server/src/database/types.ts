import type { ColumnType } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export interface FridgeContent {
  existingQuantity: number | null
  groceryListId: number | null
  id: Generated<number>
  ingredientId: number
  mealPlan: number
  userId: number
}

export interface GroceryList {
  id: Generated<number>
  mealPlanId: number | null
  product: string
  quantity: number
}

export interface Ingredient {
  id: Generated<number>
  name: string
}

export interface Meal {
  calories: number
  id: Generated<number>
  name: string
}

export interface MealIngredient {
  id: Generated<number>
  ingredientId: number
  mealId: number
  mealPlan: number | null
  quantity: number
}

export interface MealPlan {
  id: Generated<number>
  planName: string
  userId: number
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
  ingredient: Ingredient
  meal: Meal
  mealIngredient: MealIngredient
  mealPlan: MealPlan
  user: User
}
